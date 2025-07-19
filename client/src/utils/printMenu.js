import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const printMenu = (selector) => {
  const menuWrapper = document.querySelector(selector);
  if (!menuWrapper) return;
  const display = getComputedStyle(menuWrapper).display;
  console.log(display); // 'none', 'block', 'flex', etc.
  let wasDisplayNone = false;
  if (display === "none") {
    menuWrapper.style.display = "block";
    wasDisplayNone = true;
  }

  // STEP 1: Force desktop layout with inline styles
  const forceDesktopStyles = document.createElement("style");
  forceDesktopStyles.id = "force-desktop-styles";
  forceDesktopStyles.innerHTML = `
    .menu-line-item {
      flex-direction: row !important;
      align-items: flex-start !important;
    }

    .menu-line-img {
      width: 70px !important;
      height: 70px !important;
    }

    .menu-line-header {
      flex-direction: row !important;
      justify-content: space-between !important;
      align-items: center !important;
    }

    .item-price {
      margin-top: 0 !important;
    }
  `;
  document.head.appendChild(forceDesktopStyles);

  // STEP 2: Wait for all images to load
  const images = menuWrapper.querySelectorAll("img");
  const imageLoadPromises = Array.from(images).map((img) => {
    return new Promise((resolve) => {
      if (img.complete) resolve();
      else img.onload = img.onerror = () => resolve();
    });
  });

  Promise.all(imageLoadPromises).then(() => {
    html2canvas(menuWrapper, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
    })
      .then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        const ratio = pdfWidth / canvasWidth;
        const imgHeight = canvasHeight * ratio;

        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
          position -= pdfHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
          heightLeft -= pdfHeight;
        }

        pdf.save("restaurant-menu.pdf");
      })
      .catch((err) => {
        console.error("PDF generation failed:", err.message);
        alert("PDF generation failed. Please try again.");
      })
      .finally(() => {
        // STEP 3: Cleanup forced styles
        const styleTag = document.getElementById("force-desktop-styles");
        if (styleTag) styleTag.remove();
        if (wasDisplayNone) {
          menuWrapper.style.display = "none";
        }
      });
  });
};
