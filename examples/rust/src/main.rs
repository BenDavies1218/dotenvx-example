use axum::{routing::get, Json, Router};
use serde_json::{json, Value};
use std::env;

async fn handler() -> Json<Value> {
    let secret = if env::var("API_SECRET").is_ok() { "[set]" } else { "[missing]" };
    Json(json!({
        "message": "Hello from envlock + Rust",
        "secret": secret,
        "env": env::var("APP_ENV").unwrap_or_else(|_| "unknown".to_string()),
    }))
}

#[tokio::main]
async fn main() {
    let port = env::var("PORT").unwrap_or_else(|_| "3000".to_string());
    let addr = format!("0.0.0.0:{}", port);
    let app = Router::new().route("/", get(handler));
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    println!("Listening on http://{}", addr);
    axum::serve(listener, app).await.unwrap();
}
