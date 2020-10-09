import jsPDF from 'jspdf';

export class PdfGenerator {
    Save = (canvas: HTMLCanvasElement, widthInInches: number) => {
        let heightInInches = (canvas.height * widthInInches) / canvas.width;

        var doc = new jsPDF({
            unit: 'in',
            format: 'letter', // 8.5 x 11 in
        });

        let pageWidth = doc.internal.pageSize.getWidth();
        let pageHeight = doc.internal.pageSize.getHeight();
        let x = pageWidth / 2 - widthInInches / 2;
        let y = pageHeight / 2 - heightInInches / 2;

        var img = canvas.toDataURL('image/jpeg,1.0');
        doc.addImage(img, 'JPEG', x, y, widthInInches, heightInInches);
        doc.save('test.pdf');
    };
}
