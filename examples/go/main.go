package main

import (
	"encoding/json"
	"net/http"
	"os"
)

func handler(w http.ResponseWriter, r *http.Request) {
	secret := "[missing]"
	if os.Getenv("API_SECRET") != "" {
		secret = "[set]"
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Hello from envlock + Go",
		"secret":  secret,
		"env":     os.Getenv("APP_ENV"),
	})
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	http.HandleFunc("/", handler)
	http.ListenAndServe(":"+port, nil)
}
