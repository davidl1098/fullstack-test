using Microsoft.AspNetCore.Mvc;
using Products.Domain;
using Products.Dtos;
using Products.Services;

namespace Products.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController(IProductsService svc) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<Product>>> Get([FromQuery] ProductFilterDto f)
        => Ok(await svc.Get(f));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Product>> GetById(int id)
        => await svc.GetById(id) is { } p ? Ok(p) : NotFound();

    [HttpPost]
    public async Task<ActionResult<Product>> Create(ProductCreateDto dto)
    {
        var p = await svc.Create(dto);
        return CreatedAtAction(nameof(GetById), new { id = p.Id }, p);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<Product>> Update(int id, ProductUpdateDto dto)
    {
        try
        {
            var p = await svc.Update(id, dto);
            return p is null ? NotFound() : Ok(p);
        }
        catch (InvalidOperationException ex) when (ex.Message == "CONCURRENCY_CONFLICT")
        {
            return Conflict("El registro fue modificado por otro proceso. Refresca y vuelve a intentar.");
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
        => await svc.Delete(id) ? NoContent() : NotFound();

    [HttpPost("{id:int}/adjust-stock")]
    public async Task<IActionResult> AdjustStock(int id, [FromQuery] int delta)
    {
        var (ok, error, newStock) = await svc.AdjustStock(id, delta);
        if (!ok) return BadRequest(error);
        return Ok(new { productId = id, newStock });
    }

    [HttpGet("all")]
    public async Task<ActionResult<IEnumerable<Product>>> GetAll()
    => Ok(await svc.GetAll());

    [HttpPost("{id:int}/image")]
    public async Task<IActionResult> UploadImage(
    int id,
    IFormFile file,
    [FromServices] IWebHostEnvironment env,
    CancellationToken ct)
    {
        if (file is null || file.Length == 0) return BadRequest("Archivo vacío.");
        var allowed = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowed.Contains(ext)) return BadRequest("Formato no permitido.");

        var webRoot = env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot");
        var folder = Path.Combine(webRoot, "images", "products");
        Directory.CreateDirectory(folder);

        var fileName = $"{id}_{Guid.NewGuid():N}{ext}";
        var fullPath = Path.Combine(folder, fileName);

        await using (var fs = System.IO.File.Create(fullPath))
            await file.CopyToAsync(fs, ct);

        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        var imageUrl = $"{baseUrl}/images/products/{fileName}";
        var ok = await svc.UpdateImageUrl(id, imageUrl, ct);
        if (!ok) return NotFound();

        return Ok(new { imageUrl });
    }

}
