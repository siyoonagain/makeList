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

      if (size === "JL" || size === "JM") {
        grouped[name].jlLive = live;
      }
    });

    let output = "";

    Object.keys(grouped).forEach((name) => {
      const colors = Array.from(grouped[name].colors).join("/");
      const price = grouped[name].price;
      const live = grouped[name].defaultLive;
      const jlLive = grouped[name].jlLive;

      // 🔥 가격 계산
      let extra = [];

      // 주니어 가격
      if (jlLive && jlLive !== live) {
        extra.push(`주니어 ${jlLive}원`);
      }

      // 색상 가격 체크
      const colorPrices = {};

      lines.forEach((line) => {
        const cols = line.split("\t");

        if (cols[0] === name) {
          const color = cols[1];
          const size = cols[2];
          const livePrice = cols[5];

          // 주니어 제외
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

      // 사이즈 범위 계산 - 사이즈 추가 원할 경우 추가하면 됌
      const sizeOrder = [
        "XXS",
        "XS",
        "S",
        "M",
        "L",
        "XL",
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
        "3호",
        "5호",
        "7호",
        "9호",
        "11호",
        "13호",
      ];
      const sizes = Array.from(grouped[name].sizes);
      const sortedSizes = sizeOrder.filter((s) => sizes.includes(s));

      const sizeRange =
        sortedSizes.length > 1
          ? `${sortedSizes[0]}~${sortedSizes[sortedSizes.length - 1]}`
          : sortedSizes[0];

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
