function convertTXT() {
  const file = document.getElementById("txtFile").files[0];
  if (!file) {
    alert("파일 선택하세요");
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    const lines = e.target.result
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const grouped = {};

    lines.forEach((line) => {
      const cols = line.split("\t");

      const name = cols[0];
      const color = cols[1];
      const size = cols[2];
      const price = cols[4];
      const live = cols[5];

      if (!grouped[name]) {
        grouped[name] = {
          colors: new Set(),
          sizes: new Set(),
          price,
          defaultLive: live,
          jlLive: null,
        };
      }

      grouped[name].colors.add(color);
      grouped[name].sizes.add(size);

      if (size === "JL" || size === "JM" || size === "JS") {
        grouped[name].jlLive = live;
      }
    });

    let output = "";

    Object.keys(grouped).forEach((name) => {
      const colors = Array.from(grouped[name].colors).join("/");
      const price = grouped[name].price;
      const live = grouped[name].defaultLive;
      const jlLive = grouped[name].jlLive;

      let extra = [];

      if (jlLive && jlLive !== live) {
        extra.push(`주니어 ${jlLive}원`);
      }

      const colorPrices = {};

      lines.forEach((line) => {
        const cols = line.split("\t");

        if (cols[0] === name) {
          const color = cols[1];
          const size = cols[2];
          const livePrice = cols[5];

          if (!["JS", "JM", "JL"].includes(size)) {
            if (!colorPrices[color]) {
              colorPrices[color] = livePrice;
            }
          }
        }
      });

      Object.keys(colorPrices).forEach((color) => {
        const colorLive = colorPrices[color];

        if (colorLive !== live) {
          extra.push(`${color} ${colorLive}원`);
        }
      });

      let priceLine = `${price}>🎉라방할인가${live}원`;

      if (extra.length) {
        priceLine += `(${extra.join(" / ")})`;
      }

      const sizeOrder = [
        "XXS",
        "XS",
        "S",
        "M",
        "L",
        "XL",
        "2XL",
        "3XL",

        "S(100)",
        "M(110)",
        "L(120)",
        "XL(130)",
        "2XL(140)",
        "3XL(150)",

        "JS",
        "JM",
        "JL",

        "6M",
        "12M",
        "18M",

        "bebeS",
        "bebeM",

        "ADULT",
        "FREE",
        "one size",

        "3호",
        "5호",
        "7호",
        "9호",
        "11호",
        "13호",
      ];

      const sizes = Array.from(grouped[name].sizes);
      const sortedSizes = sizeOrder.filter((s) => sizes.includes(s));

      let sizeRange = "";

      if (sortedSizes.length === 1) {
        sizeRange = sortedSizes[0];
      } else if (
        sortedSizes.length === 3 &&
        sortedSizes.includes("S") &&
        sortedSizes.includes("M") &&
        sortedSizes.includes("L")
      ) {
        sizeRange = "S/M/L";
      } else {
        sizeRange = `${sortedSizes[0]}~${sortedSizes[sortedSizes.length - 1]}`;
      }

      output += `${name}\n`;
      output += `${priceLine}\n`;
      output += `${colors}\n`;
      output += `${sizeRange}\n\n`;
    });

    downloadTxt(output);
  };

  reader.readAsText(file, "utf-8");
}

function downloadTxt(content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "라방상품.txt";
  link.click();
}
