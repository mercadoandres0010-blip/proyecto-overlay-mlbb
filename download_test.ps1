$items = @(
    @{ name="AAMON"; url="https://akmwebstatic.yuanzhanapp.com/web/madmin/image_4a106e2361ac9d25166298627e2a6343.png" },
    @{ name="AKAI"; url="https://akmwebstatic.yuanzhanapp.com/web/madmin/image_5f694a5e98b116d1cbb143c8e766019b.png" },
    @{ name="ALDOUS"; url="https://akmwebstatic.yuanzhanapp.com/web/madmin/image_433f9653743e72e1e152428d26838f9e.png" },
    @{ name="ALICE"; url="https://akmwebstatic.yuanzhanapp.com/web/madmin/image_7f0da9c3ddefff4530e8dbe17054c45e.png" },
    @{ name="ALPHA"; url="https://akmweb.youngjoygame.com/web/madmin/image/796cd5f6a8ba0e76226fd0cd6866eb1e.jpg?w=100-100-28181b" },
    @{ name="ALUCARD"; url="https://akmwebstatic.yuanzhanapp.com/web/madmin/image_2f53289ddd423fa9bc95d380b6d79719.jpg" },
    @{ name="ANGELA"; url="https://akmwebstatic.yuanzhanapp.com/web/madmin/image_feffcc9c39731586e645dbef2ce70afd.png" },
    @{ name="ARGUS"; url="https://akmwebstatic.yuanzhanapp.com/web/madmin/image_2207669dcfd1d516133c922cb01de4da.png" },
    @{ name="BALMOND"; url="https://akmwebstatic.yuanzhanapp.com/web/madmin/image_be884c14d560f6bc5827e2a63439f94.png" },
    @{ name="MIYA"; url="https://indoch.s3.ml.moonlian.com/web/madmin/image_a844f9aa51baefa6878801edd85fec5e.png" }
)

if (!(Test-Path "heroes")) { New-Item -ItemType Directory -Path "heroes" }

foreach ($item in $items) {
    $filename = $item.name.ToLower().Replace(" ", "_").Replace("-", "_") + ".png"
    $path = "heroes/$filename"
    Write-Host "Descargando $($item.name)..."
    try {
        Invoke-WebRequest -Uri $item.url -OutFile $path -TimeoutSec 10
    } catch {
        Write-Host "Fallo en $($item.name)"
    }
}
