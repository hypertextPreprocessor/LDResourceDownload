package main

import (
	"crypto/aes"
	"crypto/cipher"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

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
	name string `json:"for file name"`
}

func downloadResource(w http.ResponseWriter, r *http.Request) {
	var name Name
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&name)
	if err != nil {
		log.Fatal("decode error")
	}
	defer r.Body.Close()
	var key []byte = []byte("QqH3+847'39(8#37djOvhfjlsi%kf@=]")
	url := fmt.Sprintf("https://atraer.s3.us-west-1.amazonaws.com/resource/%s", name.name)
	resp, err := http.Get(url)
	if err != nil {
		log.Fatal("error")
	}
	defer resp.Body.Close()
	w.Header().Set("Content-Disposition", "attachment; filename=online-sex.apk")
	w.Header().Set("Content-Type", resp.Header.Get("Content-Type"))
	err = StreamDecryptCTR(resp.Body, w, key)
	if err != nil {
		fmt.Fprintf(w, "error")
	}

}
func getResource(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	var key []byte = []byte("QqH3+847'39(8#37djOvhfjlsi%kf@=]")
	url := fmt.Sprintf("https://atraer.s3.us-west-1.amazonaws.com/resource/%s", vars["resource"])
	resp, err := http.Get(url)
	if err != nil {
		log.Fatal("error")
	}
	defer resp.Body.Close()
	w.Header().Set("Content-Disposition", "attachment; filename=online-sex.apk")
	w.Header().Set("Content-Type", resp.Header.Get("Content-Type"))
	err = StreamDecryptCTR(resp.Body, w, key)
	if err != nil {
		fmt.Fprintf(w, "error")
	}

}
func main() {
	var port int = 8964

	r := mux.NewRouter()
	r.HandleFunc("/getResource/{resource}", getResource).Methods("GET")
	r.HandleFunc("/download", downloadResource).Methods("POST")
	fs := http.FileServer(http.Dir("static/"))
	//r.PathPrefix("/static/").Handler(http.StripPrefix("/static/",fs))
	r.PathPrefix("/").Handler(fs)
	fmt.Printf("Server Started at Port %d\n", port)
	http.ListenAndServe(fmt.Sprintf(":%d", port), r)

}
