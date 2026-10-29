"""Generate a local, printable review card from the verified Three Monkeys link."""
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white
from reportlab.lib.units import mm
from reportlab.graphics.shapes import Drawing
from reportlab.graphics import renderPDF, renderSVG
from reportlab.graphics.barcode.qr import QrCodeWidget

URL = "https://g.page/r/CVMO-9VMLOZ3EBE/review"
OUT = Path("output/pdf")
OUT.mkdir(parents=True, exist_ok=True)
size = 60 * mm
qr = QrCodeWidget(URL, barWidth=size, barHeight=size, barBorder=4, barLevel="M")
drawing = Drawing(size, size)
drawing.add(qr)
renderSVG.drawToFile(drawing, str(OUT / "three-monkeys-review-qr.svg"))
width, height = 105 * mm, 148 * mm
pdf = canvas.Canvas(str(OUT / "three-monkeys-review-card.pdf"), pagesize=(width, height))
pdf.setTitle("Three Monkeys Phuket - Share your experience")
pdf.setAuthor("Three Monkeys Team")
pdf.setFillColor(HexColor("#F7F6EF"))
pdf.rect(0, 0, width, height, fill=1, stroke=0)
pdf.setFillColor(HexColor("#293C28"))
pdf.setFont("Helvetica-Bold", 21)
pdf.drawCentredString(width / 2, height - 47, "THREE MONKEYS")
pdf.setFont("Helvetica", 10)
pdf.drawCentredString(width / 2, height - 65, "PHUKET")
pdf.setFont("Helvetica-Bold", 16)
pdf.drawCentredString(width / 2, height - 102, "Share your experience")
x, y = (width-size)/2, 133
pdf.setFillColor(white)
pdf.rect(x, y, size, size, fill=1, stroke=0)
renderPDF.draw(drawing, pdf, x, y)
pdf.linkURL(URL, (x, y, x+size, y+size), relative=0, thickness=0)
pdf.setFillColor(HexColor("#293C28"))
pdf.setFont("Helvetica-Bold", 10)
pdf.drawCentredString(width/2, 112, "Scan to leave an honest Google review")
pdf.setFont("Helvetica", 9)
pdf.drawCentredString(width/2, 94, "Your feedback is welcome, whatever your experience.")
pdf.drawCentredString(width/2, 79, "Leaving a review is entirely optional.")
pdf.setFont("Helvetica", 8)
pdf.drawCentredString(width/2, 52, URL)
pdf.linkURL(URL, (20,44,width-20,62), relative=0, thickness=0)
pdf.setFont("Helvetica", 9)
pdf.drawCentredString(width/2, 26, "Thank you for visiting Three Monkeys.")
pdf.showPage()
pdf.save()
print("Created A6 PDF and vector QR SVG locally:", URL)
