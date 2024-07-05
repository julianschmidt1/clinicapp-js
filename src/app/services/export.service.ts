import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() { }

  exportToExcel(data: any[], fileName: string, customHeaders?: { [key: string]: string }) {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.mapDataToCustomHeaders(data, customHeaders));
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, fileName);
  }

  private mapDataToCustomHeaders(data: any[], customHeaders?: { [key: string]: string }): any[] {
    if (customHeaders) {
      return data.map(item => {
        const newItem = {};
        for (const key in item) {
          if (customHeaders[key]) {
            newItem[customHeaders[key]] = item[key];
          } else {
            newItem[key] = item[key];
          }
        }
        return newItem;
      });
    }
    return data;
  }
}
