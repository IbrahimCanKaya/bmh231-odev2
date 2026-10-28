// BMH231 Odev 2 - betik.js

let tumEtkinlikler = [];   // API'den gelen veri burada tutulacak
let seciliTur = "tumu";
let aramaMetni = "";

const kartlarKutusu = document.getElementById("kartlar");
const durumMesaji = document.getElementById("durum-mesaji");
const aramaKutusu = document.getElementById("arama-kutusu");
const filtreButonlari = document.querySelectorAll(".filtre-btn");

const turAdlari = {
  atolye: "Atölye",
  soylesi: "Söyleşi",
  topluluk: "Topluluk"
};

// ---------- C1: kartlari veriden uretme ----------
function kartOlustur(etkinlik) {
  const kart = document.createElement("article");
  kart.classList.add("kart");

  const baslik = document.createElement("h2");
  baslik.textContent = etkinlik.baslik;

  const tarih = document.createElement("p");
  tarih.textContent = "Tarih: " + new Date(etkinlik.tarih).toLocaleDateString("tr-TR");

  const yer = document.createElement("p");
  yer.textContent = "Yer: " + etkinlik.yer;

  const kontenjan = document.createElement("p");
  kontenjan.textContent = "Kontenjan: " + etkinlik.kontenjan + " kişi";

  const etiket = document.createElement("span");
  etiket.classList.add("etiket", etkinlik.tur);
  etiket.textContent = turAdlari[etkinlik.tur] || etkinlik.tur;

  kart.append(baslik, tarih, yer, kontenjan, etiket);
  return kart;
}

function kartlariCiz(liste) {
  // once eski kartlari temizle
  kartlarKutusu.replaceChildren();

  if (liste.length === 0) {
    durumMesaji.textContent = "Aramanıza uygun etkinlik yok.";
    return;
  }

  durumMesaji.textContent = "";
  liste.forEach((etkinlik) => {
    kartlarKutusu.append(kartOlustur(etkinlik));
  });
}

// ---------- C2: filtre + arama birlikte ----------
function listeyiGuncelle() {
  const sonuc = tumEtkinlikler.filter((e) => {
    const turUygun = seciliTur === "tumu" || e.tur === seciliTur;
    const aramaUygun = e.baslik.toLocaleLowerCase("tr-TR").includes(aramaMetni);
    return turUygun && aramaUygun;
  });
  kartlariCiz(sonuc);
}

filtreButonlari.forEach((buton) => {
  buton.addEventListener("click", () => {
    filtreButonlari.forEach((b) => b.classList.remove("secili"));
    buton.classList.add("secili");
    seciliTur = buton.dataset.tur;
    listeyiGuncelle();
  });
});

aramaKutusu.addEventListener("input", () => {
  aramaMetni = aramaKutusu.value.trim().toLocaleLowerCase("tr-TR");
  listeyiGuncelle();
});

// ---------- D2: fetch ve async/await ----------
async function etkinlikleriGetir() {
  durumMesaji.textContent = "Yükleniyor...";
  try {
    const yanit = await fetch("/api/etkinlikler");
    if (!yanit.ok) {
      throw new Error("Sunucu hatası: " + yanit.status);
    }
    tumEtkinlikler = await yanit.json();
    listeyiGuncelle();
  } catch (hata) {
    console.log(hata);
    durumMesaji.textContent = "Etkinlikler yüklenemedi. Lütfen daha sonra tekrar deneyin.";
  }
}

etkinlikleriGetir();

// ---------- C3: form dogrulama ----------
const form = document.getElementById("oneri-formu");
const formMesaj = document.getElementById("form-mesaj");

form.addEventListener("submit", (olay) => {
  olay.preventDefault();

  const ad = form.ad.value.trim();
  const tarih = form.tarih.value;
  const eposta = form.eposta.value.trim();
  const hatalar = [];

  if (ad.length < 5) {
    hatalar.push("Etkinlik adı en az 5 karakter olmalı.");
  }

  if (tarih === "") {
    hatalar.push("Tarih boş bırakılamaz.");
  } else {
    const bugun = new Date();
    bugun.setHours(0, 0, 0, 0);
    const secilen = new Date(tarih + "T00:00:00");
    if (secilen < bugun) {
      hatalar.push("Geçmiş bir tarih seçilemez.");
    }
  }

  const epostaKalibi = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!epostaKalibi.test(eposta)) {
    hatalar.push("Geçerli bir e-posta adresi girin.");
  }

  formMesaj.replaceChildren();
  formMesaj.className = "";

  if (hatalar.length > 0) {
    formMesaj.classList.add("hata");
    hatalar.forEach((h) => {
      const p = document.createElement("p");
      p.textContent = h;
      formMesaj.append(p);
    });
  } else {
    formMesaj.classList.add("basarili");
    formMesaj.textContent = "Teşekkürler! Öneriniz alındı.";
    form.reset();
  }
});
