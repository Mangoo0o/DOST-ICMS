import fs from 'fs';
import path from 'path';
import process from 'process';
import xlsx from 'xlsx';

function inferType(value) {
  if (value === null || value === undefined || value === '') return 'empty';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  // Try date
  const d = new Date(value);
  if (!isNaN(d.getTime()) && /\d/.test(String(value))) return 'date';
  // Try number string
  const n = Number(value);
  if (!isNaN(n) && String(value).trim() !== '') return 'number';
  return 'string';
}

function summarizeColumn(values) {
  const nonEmpty = values.filter(v => v !== null && v !== undefined && v !== '');
  const types = nonEmpty.map(inferType);
  const typeCounts = types.reduce((acc, t) => (acc[t] = (acc[t] || 0) + 1, acc), {});
  const uniqueCount = new Set(nonEmpty.map(v => typeof v === 'string' ? v.trim() : v)).size;
  const summary = { count: values.length, nonEmpty: nonEmpty.length, unique: uniqueCount, types: typeCounts };
  if ((typeCounts.number || 0) > 0) {
    const nums = nonEmpty.map(v => typeof v === 'number' ? v : Number(v)).filter(v => !isNaN(v));
    if (nums.length) {
      const sum = nums.reduce((a,b)=>a+b,0);
      const mean = sum / nums.length;
      const min = Math.min(...nums);
      const max = Math.max(...nums);
      const sd = Math.sqrt(nums.reduce((a,b)=>a + Math.pow(b-mean,2),0) / nums.length);
      Object.assign(summary, { min, max, mean, sd });
    }
  }
  return summary;
}

function analyzeWorkbook(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }
  const wb = xlsx.readFile(filePath, { cellDates: true });
  const results = {};
  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    const json = xlsx.utils.sheet_to_json(ws, { defval: '', raw: true });
    if (!json.length) {
      results[sheetName] = { rows: 0, columns: [], notes: 'Empty sheet' };
      continue;
    }
    const headers = Object.keys(json[0]);
    const columns = headers.map(h => {
      const colValues = json.map(r => r[h]);
      return { header: h, ...summarizeColumn(colValues) };
    });
    results[sheetName] = { rows: json.length, columns };
  }
  return results;
}

function printSummary(results) {
  for (const [sheet, info] of Object.entries(results)) {
    console.log(`\n=== Sheet: ${sheet} ===`);
    console.log(`Rows: ${info.rows}`);
    if (!info.columns || !info.columns.length) {
      console.log(info.notes || 'No columns');
      continue;
    }
    for (const col of info.columns) {
      const { header, count, nonEmpty, unique, types, min, max, mean, sd } = col;
      console.log(`- ${header}: count=${count}, nonEmpty=${nonEmpty}, unique=${unique}, types=${JSON.stringify(types)}${min!==undefined?`, min=${min}, max=${max}, mean=${Number(mean.toFixed?mean.toFixed(4):mean)}, sd=${Number(sd.toFixed?sd.toFixed(4):sd)}`:''}`);
    }
  }
}

const fileArg = process.argv[2];
if (!fileArg) {
  console.error('Usage: node analyze_excel.mjs <excel_file_path>');
  process.exit(1);
}

const resolved = path.resolve(fileArg);
const results = analyzeWorkbook(resolved);
printSummary(results);


