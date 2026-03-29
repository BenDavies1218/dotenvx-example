var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/", () => new {
    message = "Hello from envlock + .NET",
    secret = Environment.GetEnvironmentVariable("API_SECRET") != null ? "[set]" : "[missing]",
    env = Environment.GetEnvironmentVariable("APP_ENV") ?? "unknown"
});

app.Run();
