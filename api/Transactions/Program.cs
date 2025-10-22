

using Microsoft.EntityFrameworkCore;
using Transactions.Data;

var builder = WebApplication.CreateBuilder(args);

var allowed = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
              ?? new[] { "http://localhost:4200" };

builder.Services.AddCors(opt =>
{
opt.AddPolicy("DevCors", p => p
.WithOrigins(allowed)
.AllowAnyHeader()
.AllowAnyMethod()
);
});

builder.Services.AddDbContext<AppDbContext>(opt =>
{
    var cs = builder.Configuration.GetConnectionString("Default");

     opt.UseSqlServer(cs, sql =>
        sql.MigrationsHistoryTable("__EFMigrationsHistory_Transactions") 
    );
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpClient<Transactions.Services.IProductsClient, Transactions.Services.ProductsClient>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["ProductsService:BaseUrl"] ?? "http://localhost:5000");
});
builder.Services.AddScoped<Transactions.Services.ITransactionsService, Transactions.Services.TransactionsService>();


var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

//app.UseHttpsRedirection(); 
app.UseCors("DevCors"); 

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

app.Run();
