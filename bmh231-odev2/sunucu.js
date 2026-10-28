// BMH231 Odev 2 - Kampus Etkinlik Panosu sunucusu
// Sadece http, fs ve path modulleri kullanildi (Express yok)
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const PUBLIC_KLASOR = path.join(__dirname, "public");

// uzantiya gore Content-Type
const turler = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon"
};

function etkinlikleriOku() {
  const veri = fs.readFileSync(path.join(__dirname, "etkinlikler.json"), "utf-8");
  return JSON.parse(veri);
}

function jsonGonder(res, durum, veri) {
  res.writeHead(durum, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(veri));
}

function metinGonder(res, durum, metin, ekBasliklar) {
  const basliklar = { "Content-Type": "text/plain; charset=utf-8" };
  if (ekBasliklar) {
    Object.assign(basliklar, ekBasliklar);
  }
  res.writeHead(durum, basliklar);
  res.end(metin);
}

const sunucu = http.createServer((req, res) => {
  // her istegi ucbirime yaz
  console.log(new Date().toLocaleTimeString("tr-TR") + " " + req.method + " " + req.url);

  // GET disindaki yontemler 405
  if (req.method !== "GET") {
    metinGonder(res, 405, "405 - Bu yontem desteklenmiyor", { Allow: "GET" });
    return;
  }

  // sorgu dizesini URL sinifi ile okuyoruz
  const adres = new URL(req.url, "http://localhost:" + PORT);
  const yol = adres.pathname;

  // ---- API ----
  if (yol === "/api/etkinlikler") {
    let etkinlikler = etkinlikleriOku();
    const tur = adres.searchParams.get("tur");
    if (tur) {
      etkinlikler = etkinlikler.filter((e) => e.tur === tur);
    }
    jsonGonder(res, 200, etkinlikler);
    return;
  }

  if (yol.startsWith("/api/etkinlikler/")) {
    const parcalar = yol.split("/"); // ["", "api", "etkinlikler", "3"]
    const id = Number(parcalar[3]);
    const etkinlikler = etkinlikleriOku();
    const bulunan = etkinlikler.find((e) => e.id === id);
    if (bulunan) {
      jsonGonder(res, 200, bulunan);
    } else {
      jsonGonder(res, 404, { hata: "Etkinlik bulunamadı" });
    }
    return;
  }

  // ---- statik dosyalar (sadece public klasoru) ----
  let dosyaYolu = yol === "/" ? "/index.html" : yol;
  const tamYol = path.join(PUBLIC_KLASOR, decodeURIComponent(dosyaYolu));

  // public disina cikmayi engelle (ornegin /../sunucu.js)
  if (!tamYol.startsWith(PUBLIC_KLASOR)) {
    metinGonder(res, 404, "404 - Sayfa bulunamadi");
    return;
  }

  fs.readFile(tamYol, (hata, icerik) => {
    if (hata) {
      metinGonder(res, 404, "404 - Sayfa bulunamadi");
      return;
    }
    const uzanti = path.extname(tamYol);
    const tip = turler[uzanti] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": tip });
    res.end(icerik);
  });
});

sunucu.listen(PORT, () => {
  console.log("Sunucu calisiyor: http://localhost:" + PORT);
});
