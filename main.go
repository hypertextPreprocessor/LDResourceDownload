package main

import (
	"context"
	"crypto/aes"
	"crypto/cipher"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"net/http"
	"strings"

	"github.com/gorilla/mux"
	"github.com/redis/go-redis/v9"
)

var ctx = context.Background()

type DataUnion interface {
	string | []map[string]any
}
type CustomResonsePattern[T DataUnion] struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	//Data    string `json:"data"`
	Data T `json:"data"`
}

func StreamDecryptCTR(src io.Reader, dst io.Writer, key []byte) error {
	block, err := aes.NewCipher(key)
	if err != nil {
		return err
	}

	// 1. 读取头部 16 字节的 IV
	iv := make([]byte, aes.BlockSize)
	if _, err := io.ReadFull(src, iv); err != nil {
		return err
	}

	// 2. 创建 CTR 流解密器 (与加密逻辑一致)
	stream := cipher.NewCTR(block, iv)
	reader := &cipher.StreamReader{S: stream, R: src}

	// 3. 直接拷贝，流式解密
	// io.Copy 会自动从 reader 读取密文并进行异或运算，将明文写入 dst
	_, err = io.Copy(dst, reader)
	return err
}

type Name struct {
	Name string `json:"for file name"`
}

func downloadResource(w http.ResponseWriter, r *http.Request) {
	var name Name
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&name)
	if err != nil {
		http.Error(w, "error", http.StatusInternalServerError)
		return
	}
	defer r.Body.Close()
	var key []byte = []byte("QqH3+847'39(8#37djOvhfjlsi%kf@=]")
	url := fmt.Sprintf("https://atraer.s3.us-west-1.amazonaws.com/resource/%s", name.Name)
	resp, err := http.Get(url)
	if err != nil {
		http.Error(w, "error", http.StatusInternalServerError)
		return

	}
	defer resp.Body.Close()
	filename := fmt.Sprintf("attachment; filename=%s.apk", name.Name)
	w.Header().Set("Content-Disposition", filename)
	w.Header().Set("Content-Type", resp.Header.Get("Content-Type"))
	err = StreamDecryptCTR(resp.Body, w, key)
	if err != nil {
		fmt.Fprintf(w, "error")
		return
	}

}
func getResource(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	var key []byte = []byte("QqH3+847'39(8#37djOvhfjlsi%kf@=]")
	url := fmt.Sprintf("https://atraer.s3.us-west-1.amazonaws.com/resource/%s", vars["resource"])
	resp, err := http.Get(url)
	if err != nil {
		http.Error(w, "error", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()
	filename := fmt.Sprintf("attachment; filename=%s.apk", vars["resource"])
	w.Header().Set("Content-Disposition", filename)
	w.Header().Set("Content-Type", resp.Header.Get("Content-Type"))
	err = StreamDecryptCTR(resp.Body, w, key)
	if err != nil {
		fmt.Fprintf(w, "error")
		return
	}

}
func statInfo(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	rdb := redis.NewClient(&redis.Options{
		Addr:            ":6379",
		DisableIdentity: true,
		Password:        "",
		DB:              0,
	})
	listKey := "ip_list"
	if vars["check"] == "entry" {
		ip := getRealIP(r)
		data := map[string]any{
			"ip": ip,
		}
		jsonData, err := json.Marshal(data)
		if err != nil {
			http.Error(w, "error", http.StatusInternalServerError)
			return
		}
		err = rdb.RPush(ctx, listKey, jsonData).Err()
		if err != nil {
			http.Error(w, "error", http.StatusInternalServerError)
			return
		}
		var rs CustomResonsePattern[string] = CustomResonsePattern[string]{
			Code:    100,
			Message: "数据写入成功",
			Data:    "true",
		}

		json.NewEncoder(w).Encode(rs)
		//fmt.Fprintf(w, "数据已写入")
	} else if vars["check"] == "list" {

		val, er := rdb.LRange(ctx, listKey, 0, -1).Result()
		if er != nil {
			http.Error(w, "error", http.StatusInternalServerError)
			return
		}

		//var c []byte = []byte(val)
		var result []map[string]interface{}
		for _, item := range val {
			var obj map[string]interface{}
			if er := json.Unmarshal([]byte(item), &obj); er != nil {
				continue
			}
			result = append(result, obj)
		}

		// er = json.Unmarshal(c,&result)
		// if er != nil {
		// 	http.Error(w, "error", http.StatusInternalServerError)
		// 	return
		// }
		var rss CustomResonsePattern[[]map[string]any] = CustomResonsePattern[[]map[string]any]{
			Code:    100,
			Message: "数据写入成功",
			Data:    result,
		}
		json.NewEncoder(w).Encode(rss)

	}

}
func main() {
	var port int = 8964

	r := mux.NewRouter()
	r.HandleFunc("/getResource/{resource}", getResource).Methods("GET")
	r.HandleFunc("/download", downloadResource).Methods("POST")
	r.HandleFunc("/statInfo/{check}", statInfo).Methods("GET")
	fs := http.FileServer(http.Dir("static/"))
	//r.PathPrefix("/static/").Handler(http.StripPrefix("/static/",fs))
	r.PathPrefix("/").Handler(fs)
	fmt.Printf("Server Started at Port %d\n", port)
	http.ListenAndServe(fmt.Sprintf(":%d", port), r)

}
func getRealIP(r *http.Request) string {
	// 1. 优先尝试获取 X-Forwarded-For
	// 格式通常是: "client_ip, proxy1_ip, proxy2_ip"
	xff := r.Header.Get("X-Forwarded-For")
	if xff != "" {
		ips := strings.Split(xff, ",")
		realIP := strings.TrimSpace(ips[0])
		if realIP != "" {
			return realIP
		}
	}

	// 2. 如果 XFF 为空，尝试获取 X-Real-IP
	realIP := r.Header.Get("X-Real-IP")
	if realIP != "" {
		return strings.TrimSpace(realIP)
	}

	// 3. 最后获取直接连接的 IP (包含端口号，所以需要 SplitHostPort)
	ip, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		// 如果 r.RemoteAddr 没有端口或者格式异常，直接返回原始值
		return r.RemoteAddr
	}
	return ip
}
