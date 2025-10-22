using System.Net.Http.Json;
using Microsoft.Extensions.Configuration;
using Transactions.Dtos;

namespace Transactions.Services;

public class ProductsClient : IProductsClient
{
    private readonly HttpClient _http;

    public ProductsClient(HttpClient http, IConfiguration cfg)
    {
        _http = http;
        _http.BaseAddress = new Uri(cfg["ProductsService:BaseUrl"] ?? "http://localhost:5000");
    }

    public Task<ProductDto?> Get(int id)
        => _http.GetFromJsonAsync<ProductDto>($"api/products/{id}");

    public async Task<(bool ok, string? error)> AdjustStock(int id, int delta)
    {
        var res = await _http.PostAsync($"api/products/{id}/adjust-stock?delta={delta}", content: null);
        if (res.IsSuccessStatusCode) return (true, null);
        var body = await res.Content.ReadAsStringAsync();
        return (false, $"{(int)res.StatusCode} {body}");
    }
}
