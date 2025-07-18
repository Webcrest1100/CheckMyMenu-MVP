import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const MenuCard = ({ items }) => {
  const grouped = items.reduce((acc, item) => {
    const category = item.category || "Uncategorized";
    acc[category] = [...(acc[category] || []), item];
    return acc;
  }, {});

  const printMenu = () => {
    const menuWrapper = document.querySelector(".menu-wrapper");
    if (!menuWrapper) return;

    // Wait until all images are loaded
    const images = menuWrapper.querySelectorAll("img");
    const imageLoadPromises = Array.from(images).map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete) resolve();
          else {
            img.onload = img.onerror = () => resolve();
          }
        })
    );

    Promise.all(imageLoadPromises).then(() => {
      html2canvas(menuWrapper, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
      }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("restaurant-menu.pdf");
      });
    });
  };

  return (
    <>
      <button onClick={printMenu}>Print Menu</button>
      <div className="menu-wrapper">
        <h1 className="menu-title">MAIN’S</h1>
        <div className="menu-columns">
          {Object.keys(grouped).map((category) => (
            <div className="menu-section" key={category}>
              <h2 className="menu-category">{category.toUpperCase()}</h2>
              <div className="menu-list">
                {grouped[category].map((item) => (
                  <div className="menu-line-item" key={item._id}>
                    <img
                      src={`${import.meta.env.VITE_API_URL}${item.imageUrl}`}
                      alt={item.name}
                      className="menu-line-img"
                    />
                    <div className="menu-line-text">
                      <div className="menu-line-header">
                        <span className="item-name">{item.name}</span>
                        <span className="item-price">Rs. {item.price}</span>
                      </div>
                      <div className="item-description">{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default MenuCard;
