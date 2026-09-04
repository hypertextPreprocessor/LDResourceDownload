window.NIGHTPLAY_CONTROL_API_BASE = window.NIGHTPLAY_CONTROL_API_BASE || ''
window.NIGHTPLAY_VIDEO_API_BASE = window.NIGHTPLAY_VIDEO_API_BASE || ''
document.documentElement.dataset.controlApiConfigured = window.NIGHTPLAY_CONTROL_API_BASE ? 'true' : 'false'
document.documentElement.dataset.videoApiConfigured = window.NIGHTPLAY_VIDEO_API_BASE ? 'true' : 'false'
