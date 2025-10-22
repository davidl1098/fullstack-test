
using Microsoft.EntityFrameworkCore;
using Products.Data;

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
        sql.MigrationsHistoryTable("__EFMigrationsHistory_Products")
    );
});

builder.Services.AddScoped<Products.Services.IProductsService, Products.Services.ProductsService>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

//app.UseHttpsRedirection();
app.UseCors("DevCors");

app.MapControllers();
app.UseStaticFiles();


using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

app.Run();
