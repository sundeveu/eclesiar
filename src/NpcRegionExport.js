// ==UserScript==
// @name         Eclesiar - Export Region NPCs to CSV
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Eksportuje NPC z regionów kraju (regiony -> lista NPC z wypłatą i firmą)
// @author       p0tfur
// @match        https://eclesiar.com/country/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  // ============================================
  // KONFIGURACJA
  // ============================================
  const CONFIG = {
    // Opóźnienie między requestami (ms) - żeby nie przeciążyć serwera
    REQUEST_DELAY: 1000,
    // Bazowy URL
    BASE_URL: location.origin,
  };

  // ============================================
  // GŁÓWNE FUNKCJE
  // ============================================

  /**
   * Funkcja pomocnicza do opóźnienia
   * @param {number} ms - milisekundy
   * @returns {Promise}
   */
  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Pobiera HTML strony
   * @param {string} url - URL do pobrania
   * @returns {Promise<string>} - HTML strony
   */
  async function fetchPage(url) {
    try {
      const response = await fetch(url, {
        credentials: "include", // Ważne dla zalogowanych sesji
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.text();
    } catch (error) {
      console.error(`Błąd pobierania strony ${url}:`, error);
      return null;
    }
  }

  /**
   * Parsuje HTML i zwraca DOM
   * @param {string} html - HTML do sparsowania
   * @returns {Document}
   */
  function parseHTML(html) {
    const parser = new DOMParser();
    return parser.parseFromString(html, "text/html");
  }

  /**
   * Aktualizuje status w UI
   * @param {string} message - wiadomość
   */
  function updateStatus(message) {
    const statusEl = document.getElementById("region-npc-export-status");
    if (statusEl) {
      statusEl.textContent = message;
    }
    console.log(`[Export] ${message}`);
  }

  /**
   * Bezpiecznie pobiera tekst z elementu
   * @param {Element|null} element - element DOM
   * @returns {string}
   */
  function getText(element) {
    return element ? element.textContent.trim() : "";
  }

  /**
   * Konwertuje dane do formatu CSV
   * @param {Array} data - dane do konwersji
   * @returns {string} - CSV string
   */
  function convertToCSV(data) {
    if (data.length === 0) return "";

    // Nagłówki
    const headers = [
      "Country ID",
      "Country Name",
      "Region ID",
      "Region Name",
      "Region URL",
      "NPC ID",
      "NPC Name",
      "NPC URL",
      "Business ID",
      "Business Name",
      "Business URL",
      "Salary",
    ];

    // Wiersze
    const rows = data.map((item) => {
      return [
        item.countryId,
        `"${item.countryName.replace(/"/g, '""')}"`,
        item.regionId,
        `"${item.regionName.replace(/"/g, '""')}"`,
        item.regionUrl,
        item.npcId,
        `"${item.npcName.replace(/"/g, '""')}"`,
        item.npcUrl,
        item.businessId,
        `"${item.businessName.replace(/"/g, '""')}"`,
        item.businessUrl,
        `"${item.salary.replace(/"/g, '""')}"`,
      ].join(",");
    });

    return [headers.join(","), ...rows].join("\n");
  }

  /**
   * Pobiera plik CSV
   * @param {string} csv - zawartość CSV
   * @param {string} filename - nazwa pliku
   */
  function downloadCSV(csv, filename) {
    // Dodaj BOM dla poprawnego kodowania UTF-8 w Excelu
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (navigator.msSaveBlob) {
      // IE 10+
      navigator.msSaveBlob(blob, filename);
    } else {
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  /**
   * Pobiera aktualny kraj (id + nazwa)
   * @returns {{id: string, name: string}}
   */
  function getCountryInfo() {
    const countryIdMatch = window.location.pathname.match(/\/country\/(\d+)/);
    const countryId = countryIdMatch ? countryIdMatch[1] : "";

    const countryNameEl = document.querySelector(".country-header .title strong");
    const countryName = getText(countryNameEl);

    return { id: countryId, name: countryName };
  }

  /**
   * Pobiera listę regionów z aktualnej strony kraju
   * @returns {Array<{id: string, name: string, url: string}>}
   */
  function getRegionsFromCountryPage() {
    const regions = [];
    const regionLinks = Array.from(document.querySelectorAll('a[href^="/region/"][href$="/details"]'));

    const seen = new Set();
    regionLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (!href) return;

      const match = href.match(/\/region\/(\d+)\/details/);
      if (!match) return;

      const regionId = match[1];
      if (seen.has(regionId)) return;
      seen.add(regionId);

      const regionName = getText(link).replace(/\s+/g, " ");
      const regionUrl = `${CONFIG.BASE_URL}${href}`;

      regions.push({
        id: regionId,
        name: regionName,
        url: regionUrl,
      });
    });

    return regions;
  }

  /**
   * Pobiera NPC z tabeli regionu
   * @param {Document} doc - dokument DOM
   * @returns {Array<{npcId: string, npcName: string, npcUrl: string, businessId: string, businessName: string, businessUrl: string, salary: string}>}
   */
  function getNpcsFromRegionPage(doc) {
    const rowSelectors = ["table.desktop-only tbody tr", "table.table-striped tbody tr", "tbody tr"];

    let rows = [];
    for (const selector of rowSelectors) {
      rows = Array.from(doc.querySelectorAll(selector));
      if (rows.length > 0) break;
    }

    const results = [];

    rows
      .filter((row) => row.querySelector("a[href^='/npc/']"))
      .forEach((row) => {
        try {
          const npcCell = row.querySelector("td.column-0 a[href^='/npc/']") || row.querySelector("a[href^='/npc/']");
          const businessCell =
            row.querySelector("td.column-1 a[href^='/business/']") || row.querySelector("a[href^='/business/']");
          const salaryCell =
            row.querySelector("td.column-2") ||
            row.querySelector("td:nth-child(3)") ||
            row.querySelector("td:last-child");

          const npcHref = npcCell ? npcCell.getAttribute("href") : "";
          const businessHref = businessCell ? businessCell.getAttribute("href") : "";

          const npcId = npcHref ? npcHref.replace("/npc/", "") : "";
          const npcName = getText(npcCell);
          const npcUrl = npcHref ? `${CONFIG.BASE_URL}${npcHref}` : "";

          const businessId = businessHref ? businessHref.replace("/business/", "") : "";
          const businessName = getText(businessCell);
          const businessUrl = businessHref ? `${CONFIG.BASE_URL}${businessHref}` : "";

          const salary = getText(salaryCell);

          results.push({
            npcId: npcId,
            npcName: npcName,
            npcUrl: npcUrl,
            businessId: businessId,
            businessName: businessName,
            businessUrl: businessUrl,
            salary: salary,
          });
        } catch (error) {
          console.error("Błąd parsowania NPC w regionie:", error);
        }
      });

    return results;
  }

  /**
   * Główna funkcja eksportu
   */
  async function exportRegionNpcs() {
    const allData = [];

    try {
      const countryInfo = getCountryInfo();

      updateStatus("Szukanie regionów na stronie kraju...");
      const regions = getRegionsFromCountryPage();
      updateStatus(`Znaleziono regionów: ${regions.length}`);

      if (regions.length === 0) {
        updateStatus("Brak regionów do eksportu. Sprawdź selektory.");
        return;
      }

      for (let i = 0; i < regions.length; i++) {
        const region = regions[i];
        updateStatus(`Region ${i + 1}/${regions.length}: ${region.name || region.id}`);

        await delay(CONFIG.REQUEST_DELAY);
        const regionHtml = await fetchPage(region.url);
        if (!regionHtml) {
          console.error(`Nie można pobrać regionu ${region.id}`);
          continue;
        }

        const regionDoc = parseHTML(regionHtml);
        const regionNpcs = getNpcsFromRegionPage(regionDoc);

        if (regionNpcs.length === 0) {
          allData.push({
            countryId: countryInfo.id,
            countryName: countryInfo.name,
            regionId: region.id,
            regionName: region.name,
            regionUrl: region.url,
            npcId: "",
            npcName: "",
            npcUrl: "",
            businessId: "",
            businessName: "",
            businessUrl: "",
            salary: "",
          });
          continue;
        }

        regionNpcs.forEach((npc) => {
          allData.push({
            countryId: countryInfo.id,
            countryName: countryInfo.name,
            regionId: region.id,
            regionName: region.name,
            regionUrl: region.url,
            npcId: npc.npcId,
            npcName: npc.npcName,
            npcUrl: npc.npcUrl,
            businessId: npc.businessId,
            businessName: npc.businessName,
            businessUrl: npc.businessUrl,
            salary: npc.salary,
          });
        });
      }

      updateStatus(`Generowanie CSV z ${allData.length} wpisami...`);
      const csv = convertToCSV(allData);
      const timestamp = new Date().toISOString().slice(0, 10);
      downloadCSV(csv, `eclesiar_region_npcs_${timestamp}.csv`);

      updateStatus(`Zakończono! Wyeksportowano ${allData.length} wpisów.`);
    } catch (error) {
      console.error("Błąd podczas eksportu:", error);
      updateStatus(`Błąd: ${error.message}`);
    }
  }

  // ============================================
  // UI - PRZYCISK EKSPORTU
  // ============================================

  function createExportButton() {
    // Kontener
    const container = document.createElement("div");
    container.style.cssText = `
            position: fixed;
            top: 400px;
            right: 10px;
            z-index: 9999;
            background: #1d242b;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            font-family: Arial, sans-serif;
            color: #fff;
            min-width: 260px;
        `;

    // Tytuł
    const title = document.createElement("h4");
    title.textContent = "📊 Export Region NPCs";
    title.style.cssText = "margin: 0 0 10px 0; font-size: 14px;";
    container.appendChild(title);

    // Status
    const status = document.createElement("div");
    status.id = "region-npc-export-status";
    status.textContent = "Gotowy do eksportu";
    status.style.cssText = `
            font-size: 12px;
            margin-bottom: 10px;
            padding: 8px;
            background: rgba(255,255,255,0.1);
            border-radius: 4px;
            word-wrap: break-word;
        `;
    container.appendChild(status);

    // Przycisk
    const button = document.createElement("button");
    button.textContent = "🚀 Rozpocznij eksport";
    button.style.cssText = `
            width: 100%;
            padding: 10px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
            font-weight: bold;
        `;
    button.addEventListener("click", () => {
      button.disabled = true;
      button.textContent = "⏳ Eksportowanie...";
      button.style.background = "#666";
      exportRegionNpcs().finally(() => {
        button.disabled = false;
        button.textContent = "🚀 Rozpocznij eksport";
        button.style.background = "#4CAF50";
      });
    });
    container.appendChild(button);

    // Info
    const info = document.createElement("div");
    info.innerHTML = `
            <small style="color: #888; display: block; margin-top: 10px;">
                Opóźnienie: ${CONFIG.REQUEST_DELAY}ms<br>
                Strona: tylko aktualny kraj
            </small>
        `;
    container.appendChild(info);

    document.body.appendChild(container);
  }

  // ============================================
  // INICJALIZACJA
  // ============================================

  // Poczekaj na załadowanie strony
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createExportButton);
  } else {
    createExportButton();
  }
})();
