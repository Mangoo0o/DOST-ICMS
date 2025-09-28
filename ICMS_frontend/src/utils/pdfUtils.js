import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist/build/pdf.mjs';

// Configure pdf.js worker with multiple fallback options
const setWorkerSrc = () => {
  try {
    // For Vite development, use relative path
    if (import.meta.env.DEV) {
      GlobalWorkerOptions.workerSrc = './node_modules/pdfjs-dist/build/pdf.worker.min.mjs';
    } else {
      // For production builds
      GlobalWorkerOptions.workerSrc = '/node_modules/pdfjs-dist/build/pdf.worker.min.mjs';
    }
  } catch (error) {
    try {
      // Fallback to CDN worker
      GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    } catch (cdnError) {
      console.warn('Could not set PDF worker, using default');
    }
  }
};

setWorkerSrc();

// Extract text content from a PDF File using pdf.js
export async function extractPdfTextFromFile(file) {
  if (!file) return '';
  
  try {
    console.log('Starting PDF text extraction for file:', file.name);
    console.log('File type:', file.type);
    console.log('File size:', file.size);
    
    const arrayBuffer = await file.arrayBuffer();
    console.log('File converted to ArrayBuffer, size:', arrayBuffer.byteLength);
    
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    console.log('PDF loaded, pages:', pdf.numPages);
    
    let allText = '';
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => (Object.prototype.hasOwnProperty.call(item, 'str') ? item.str : ''))
        .join(' ');
      allText += (pageNum > 1 ? '\n\n' : '') + pageText;
      console.log(`Page ${pageNum} text length:`, pageText.length);
    }
    
    const finalText = allText.trim();
    console.log('Final extracted text length:', finalText.length);
    console.log('First 500 characters:', finalText.substring(0, 500));
    
    return finalText;
  } catch (err) {
    console.error('Failed to extract PDF text:', err);
    throw new Error(`PDF text extraction failed: ${err.message}`);
  }
}

// Enhanced parser for the provided PDF template structure
export function parsePdfFields(text) {
  if (!text) {
    console.log('No text provided to parsePdfFields');
    return { client: {}, address: {}, schedule: {}, samples: [] };
  }

  console.log('Parsing PDF text, length:', text.length);
  console.log('Text preview:', text.substring(0, 1000));

  // Normalize unicode dashes to ASCII hyphen to make range matching consistent
  text = text.replace(/[\u2012\u2013\u2014\u2212]/g, '-');
  const normalize = (s) => (s || '').replace(/\s+/g, ' ').trim();
  
  // Split by common delimiters and clean up - be more aggressive with splitting
  let parts = text.split(/[\n\r]+|●|•/).map(p => normalize(p)).filter(Boolean);
  
  // If we only get 1 part, try more aggressive splitting
  if (parts.length === 1) {
    console.log('Only 1 part found, trying more aggressive splitting...');
    // Try splitting on multiple spaces, periods, and other delimiters
    parts = text.split(/\s{3,}|\s{2,}|\.\s+/).map(p => normalize(p)).filter(Boolean);
    console.log('After aggressive splitting, parts count:', parts.length);
  }
  
  // If still only 1 part, try splitting on common table delimiters
  if (parts.length === 1) {
    console.log('Still only 1 part, trying table-specific splitting...');
    // Look for patterns that might indicate table rows
    const tableRowPattern = /(Weighing Scale|Test - Weights|Sphygmomanometer|Thermometer|Thermohygrometer|Test Weights|Proving Tanks|Test Measure|Fuel Dispensing Pump|Road Tankers)/gi;
    const matches = [...text.matchAll(tableRowPattern)];
    
    if (matches.length > 0) {
      console.log('Found table row patterns:', matches.length);
      // Split the text around these patterns
      const splitPoints = matches.map(match => match.index);
      parts = [];
      let lastIndex = 0;
      
      for (let i = 0; i < splitPoints.length; i++) {
        const start = splitPoints[i];
        const end = i < splitPoints.length - 1 ? splitPoints[i + 1] : text.length;
        const part = text.substring(start, end).trim();
        if (part) {
          parts.push(normalize(part));
        }
        lastIndex = end;
      }
      
      // Also add any remaining text
      if (lastIndex < text.length) {
        const remaining = text.substring(lastIndex).trim();
        if (remaining) {
          parts.push(normalize(remaining));
        }
      }
    }
  }
  
  console.log('Final split parts count:', parts.length);
  console.log('Parts preview:', parts.slice(0, 20));

  const kv = {};
  for (const p of parts) {
    // First, extract multiple label:value pairs within the same line
    // Example: "Customer: MW RICE & SHINE   Tel No.: 0948078086   Fax No.: n/a"
    const multiRegex = /([A-Za-z][A-Za-z\s/\.\-#]+):\s*([^:]+?)(?=(?:\s+[A-Za-z][A-Za-z\s/\.\-#]+\s*:)|$)/g;
    let matchedAny = false;
    let match;
    while ((match = multiRegex.exec(p)) !== null) {
      matchedAny = true;
      const key = normalize(match[1]).toLowerCase();
      const val = normalize(match[2]);
      if (key) kv[key] = val;
    }
    if (matchedAny) continue;

    // Fallback: try patterns: "Label : Value" or "Label: Value" or "Label Value"
    let m = p.match(/^([^:]+):\s*(.+)$/);
    if (!m) {
      m = p.match(/^([A-Za-z][A-Za-z\s/\.\-#]+)\s+(.{2,})$/);
    }
    if (m) {
      const key = normalize(m[1]).toLowerCase();
      const val = normalize(m[2]);
      if (key) kv[key] = val;
    }
  }

  console.log('Key-value pairs found:', kv);

  const pick = (...keys) => {
    for (const k of keys) {
      const v = kv[k.toLowerCase()];
      if (v) return v;
    }
    return '';
  };

  // Helper to read values when the PDF puts label and value on separate lines
  const seqPick = (label, isHeader) => {
    const target = label.toLowerCase();
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].toLowerCase().includes(target)) {
        for (let j = i + 1; j < parts.length; j++) {
          const candidate = parts[j];
          const cl = candidate.toLowerCase();
          if (!candidate) continue;
          if (isHeader && isHeader(cl)) continue;
          return candidate;
        }
      }
    }
    return '';
  };

  const toBool = (s) => /^(yes|true|1)$/i.test(s || '') ? 1 : 0;
  const onlyDigits = (s) => (s || '').replace(/[^0-9]/g, '');

  const firstName = pick('first name');
  const lastName = pick('last name');
  // Treat "Customer" as the primary source of the person's name
  const nameFallback = pick('customer', 'customer name', 'name');
  let resolvedFirst = firstName;
  let resolvedLast = lastName;
  if (!resolvedFirst && !resolvedLast && nameFallback) {
    const partsName = nameFallback.split(' ');
    if (partsName.length > 1) {
      resolvedLast = partsName.pop();
      resolvedFirst = partsName.join(' ');
    } else {
      resolvedFirst = nameFallback;
    }
  }

  const email = pick('email', 'email address');
  // Map telephone labels to contact number (including variants without space or with colon variations)
  const contact = pick(
    'contact number', 'contact no', 'contact',
    'tel no', 'tel. no', 'telephone', 'tel no.', 'tel no.:', 'tel no', 'tel. no:'
  );
  const company = pick('company', 'company name', 'establishment');
  const industry = pick('type of industry', 'industry type');
  const companyHead = pick('company head', 'head of company');
  const province = pick('province');
  const city = pick('city/municipality', 'city / municipality', 'city', 'municipality');
  const barangay = pick('barangay', 'brgy');
  // R1 form has a single Address line. Prefer that as a freeform address string
  let addressLine = pick('address');
  const gender = pick('gender');
  const ageRaw = pick('age');
  const age = ageRaw ? parseInt(onlyDigits(ageRaw), 10) : undefined;
  const pwd = pick('pwd status');
  const fourPs = pick('4ps beneficiary', '4ps');

  const normalizeDate = (s) => {
    if (!s) return '';
    const m = s.match(/\d{4}-\d{2}-\d{2}/);
    return m ? m[0] : '';
  };
  const toIsoDate = (s) => {
    if (!s) return '';
    // Accept formats like 'July 15, 2025', 'Jul 15, 2025', optionally with time
    const m = s.match(/\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+([0-9]{1,2}),\s*([0-9]{4})(?:\s+[0-9]{1,2}:[0-9]{2}\s*(?:AM|PM))?\b/i);
    if (!m) return '';
    const monthNames = {
      january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
      july: 7, august: 8, september: 9, sept: 9, october: 10, november: 11, december: 12
    };
    const mm = monthNames[m[1].toLowerCase()];
    const dd = String(parseInt(m[2], 10)).padStart(2, '0');
    const yyyy = m[3];
    if (!mm) return '';
    return `${String(mm).padStart(2,'0')}-${dd}-${yyyy}`.replace(/^(\d{2})-(\d{2})-(\d{4})$/, (__, mo, da, yr) => `${yr}-${mo}-${da}`);
  };
  const dateScheduled = normalizeDate(pick('scheduled date', 'date scheduled', 'preferred date')) ||
                        toIsoDate(pick('date', 'time')) ||
                        (function findHeaderDate() {
                          const m = text.match(/\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+([0-9]{1,2}),\s*([0-9]{4})(?:\s+[0-9]{1,2}:[0-9]{2}\s*(?:AM|PM))?/i);
                          if (!m) return '';
                          return toIsoDate(m[0]);
                        })();

  // Try to get expected completion from labels or the 'Report Due On' field
  let dateExpected = normalizeDate(pick('expected completion', 'expected date of completion', 'expected completion date'));
  if (!dateExpected) {
    // Directly parse 'Report Due On' line
    const reportDueKV = pick('report due on', 'report due date');
    const reportDueRegex = text.match(/Report\s*Due\s*On\s*:\s*([^\n\r]+)/i);
    const reportDueRaw = reportDueKV || (reportDueRegex ? reportDueRegex[1] : '');
    const parsedReportDue = toIsoDate(reportDueRaw);
    if (parsedReportDue) dateExpected = parsedReportDue;
  }

  // Extract PDF's own reference number (e.g., R1/Rl/RI-072025-MET-0669)
  let pdfReferenceNumber = pick('test reference no', 'request reference no', 'reference no', 'test reference number', 'reference number');
  if (!pdfReferenceNumber) {
    const m = text.match(/\bR[1lI]-?\d{6,}-?[A-Z]{3}-?\d{3,}\b/i);
    if (m) pdfReferenceNumber = m[0];
  }

  // Direct full-text regex fallbacks for Customer, Tel No, Address when key-value splitting fails
  const customerMatch = text.match(/Customer\s*:\s*([A-Z\s&]+?)(?=\s+Tel\s*No\.?\s*:)/i);
  const telMatch = text.match(/Tel\s*No\.?\s*:\s*([0-9\s\-()]+)/i);
  const contactMatch = text.match(/Contact\s*No\.?\s*[:\s]*([0-9\s\-(),]+)/i);
  const addrMatch = text.match(/Address\s*:\s*([^:]+?)(?=\s+Fax\s*No\.?\s*:|$)/i);
  
  // Alternative address regex to catch cases where Fax No might not be present
  const addrMatchAlt = text.match(/Address\s*:\s*([^:]+?)(?=\s+\d+\.\s+CALIBRATION|$)/i);
  
  console.log('Address regex matches:', {
    addrMatch: addrMatch ? addrMatch[1] : null,
    addrMatchAlt: addrMatchAlt ? addrMatchAlt[1] : null
  });

  // Choose the best address line among key-value and regex candidates
  const candidatesRaw = [addressLine, addrMatch && addrMatch[1], addrMatchAlt && addrMatchAlt[1]].filter(Boolean);
  const candidates = candidatesRaw
    .map(s => normalize(s).replace(/[\s,]+$/g, '')) // trim and remove trailing commas/spaces
    .filter(Boolean);
  if (candidates.length > 0) {
    const score = (s) => {
      let sc = s.length;
      const low = s.toLowerCase();
      if (low.includes('la union')) sc += 50;
      if (low.includes('province')) sc += 20;
      return sc;
    };
    const best = candidates.reduce((a, b) => (score(b) > score(a) ? b : a));
    if (best && best !== addressLine) {
      addressLine = best;
      console.log('Address chosen (best candidate):', addressLine);
    }
  }

  const client = {
    first_name: resolvedFirst,
    last_name: resolvedLast,
    name: nameFallback, // still send combined as fallback
    contact_number: contact,
    email,
    company,
    industry_type: industry,
    company_head: companyHead,
    gender,
    age: Number.isFinite(age) ? String(age) : '',
    is_pwd: toBool(pwd),
    is_4ps: toBool(fourPs),
  };

  if (!client.name && customerMatch) {
    client.name = normalize(customerMatch[1]);
    console.log('Customer name extracted from regex:', client.name);
  }
  if (!client.contact_number && telMatch) {
    const digitsOnly = (s) => (s || '').replace(/[^0-9]/g, '');
    const d = digitsOnly(telMatch[1]);
    client.contact_number = d || telMatch[1].trim();
    console.log('Contact number extracted from Tel No regex:', client.contact_number);
  }
  if (!client.contact_number && contactMatch) {
    // Extract the first phone number from the contact string
    const phoneMatch = contactMatch[1].match(/(\d{10,11})/);
    if (phoneMatch) {
      client.contact_number = phoneMatch[1];
    } else {
      const digitsOnly = (s) => (s || '').replace(/[^0-9]/g, '');
      const d = digitsOnly(contactMatch[1]);
      client.contact_number = d || contactMatch[1].trim();
    }
    console.log('Contact number extracted from Contact No regex:', client.contact_number);
  }
  if (!addressLine && addrMatch) {
    addressLine = normalize(addrMatch[1]);
    console.log('Address extracted from regex:', addressLine);
  }
  if (!addressLine && addrMatchAlt) {
    addressLine = normalize(addrMatchAlt[1]);
    console.log('Address extracted from alternative regex:', addressLine);
  }

  // Parse address line to extract province, city, and barangay
  let parsedProvince = province;
  let parsedCity = city;
  let parsedBarangay = barangay;

  if (addressLine && !parsedProvince && !parsedCity && !parsedBarangay) {
    console.log('Parsing address line:', addressLine);
    
    // Common patterns for Philippine addresses
    // Pattern 1: "Barangay, City, Province"
    // Pattern 2: "City, Province"
    // Pattern 3: "Barangay, City"
    
    const addressParts = addressLine.split(',').map(part => part.trim()).filter(part => part.length > 0);
    console.log('Address parts:', addressParts);
    
    if (addressParts.length >= 2) {
      // Try to identify province (usually the last part)
      const lastPart = addressParts[addressParts.length - 1];
      const secondLastPart = addressParts[addressParts.length - 2];
      
      // Check if last part looks like a province
      if (lastPart.toLowerCase().includes('province') || 
          lastPart.toLowerCase().includes('la union') ||
          lastPart.toLowerCase().includes('pangasinan') ||
          lastPart.toLowerCase().includes('ilocos') ||
          lastPart.toLowerCase().includes('benguet') ||
          lastPart.toLowerCase().includes('mountain province')) {
        parsedProvince = lastPart;
        parsedCity = secondLastPart;
        if (addressParts.length >= 3) {
          parsedBarangay = addressParts[addressParts.length - 3];
        }
      } else {
        // Check if any part contains province names
        for (let i = 0; i < addressParts.length; i++) {
          const part = addressParts[i].toLowerCase();
          if (part.includes('la union') || part.includes('pangasinan') || 
              part.includes('ilocos') || part.includes('benguet') || 
              part.includes('mountain province')) {
            parsedProvince = addressParts[i];
            // Everything before this part is city/barangay
            if (i > 0) {
              parsedCity = addressParts[i - 1];
            }
            if (i > 1) {
              parsedBarangay = addressParts[i - 2];
            }
            break;
          }
        }
        
        // If no province found, assume last part is city, second last is barangay
        if (!parsedProvince) {
          parsedCity = lastPart;
          if (addressParts.length >= 2) {
            parsedBarangay = secondLastPart;
          }
        }
      }
    } else if (addressParts.length === 1) {
      // Single part - could be city or barangay
      parsedCity = addressParts[0];
    }
    
    console.log('Parsed address components:', {
      province: parsedProvince,
      city: parsedCity,
      barangay: parsedBarangay
    });
  }

  const address = { 
    province: parsedProvince || province, 
    city: parsedCity || city, 
    barangay: parsedBarangay || barangay, 
    address_line: addressLine 
  };
  const schedule = { date_scheduled: dateScheduled, date_expected_completion: dateExpected };

  // Function to parse the specific PDF format we're seeing
  function parseSpecificPdfFormat(text) {
    const samples = [];
    console.log('Trying specific PDF format parser...');
    
    // Look for the specific table pattern in the text
    // Pattern: Equipment Type   Sample Code   Calibration Method   Method Code   Quantity   Unit Cost   Total
    // More flexible pattern to handle the actual format
    const tablePattern = /(Weighing Scale|Test - Weights|Sphygmomanometer|Thermometer|Thermohygrometer|Test Weights|Proving Tanks|Test Measure|Fuel Dispensing Pump|Road Tankers)\s+([A-Z0-9\-\s]+?)\s+([A-Za-z\s\(\)]+?)\s+([A-Z0-9\-\s]+?)\s+(\d+)\s+(\d+\.\d{2})\s+(\d+\.\d{2})/gi;
    
    let match;
    while ((match = tablePattern.exec(text)) !== null) {
      const [, equipmentType, sampleCode, calibrationMethod, methodCode, quantity, unitCost, total] = match;
      
      console.log('Found specific format match:', {
        equipmentType,
        sampleCode,
        calibrationMethod: calibrationMethod.trim(),
        methodCode,
        quantity,
        unitCost,
        total
      });
      
      const sample = {
        section: 'Calibration of Non-Automatic Weighing Instrument', // Default section
        type: equipmentType.trim(),
        range: calibrationMethod.trim(),
        serialNo: sampleCode.trim(),
        price: unitCost,
        quantity: parseInt(quantity, 10),
      };
      
      samples.push(sample);
    }
    
    // If the above pattern didn't work, try a more flexible approach
    if (samples.length === 0) {
      console.log('Specific pattern didn\'t work, trying flexible approach...');
      
      // Look for equipment types followed by sample codes and prices
      const equipmentTypes = ['Weighing Scale', 'Test - Weights', 'Sphygmomanometer', 'Thermometer', 'Thermohygrometer'];
      
      for (const equipmentType of equipmentTypes) {
        const regex = new RegExp(`${equipmentType}\\s+([A-Z0-9\\-\\s]+?)\\s+([A-Za-z\\s\\(\\)]+?)\\s+([A-Z0-9\\-\\s]+?)\\s+(\\d+)\\s+(\\d+\\.\\d{2})\\s+(\\d+\\.\\d{2})`, 'gi');
        const match = regex.exec(text);
        
        if (match) {
          const [, sampleCode, calibrationMethod, methodCode, quantity, unitCost, total] = match;
          
          console.log('Found flexible format match:', {
            equipmentType,
            sampleCode,
            calibrationMethod: calibrationMethod.trim(),
            methodCode,
            quantity,
            unitCost,
            total
          });
          
          const sample = {
            section: 'Calibration of Non-Automatic Weighing Instrument',
            type: equipmentType,
            range: calibrationMethod.trim(),
            serialNo: sampleCode.trim(),
            price: unitCost,
            quantity: parseInt(quantity, 10),
          };
          
          samples.push(sample);
        }
      }
    }
    
    console.log('Specific format parser found', samples.length, 'samples');
    return samples;
  }

  // Enhanced sample details parsing for the actual 5-column table structure
  const samples = [];
  console.log('Starting sample parsing...');
  
  // First, try to parse the specific format we see in the PDF
  const specificFormatSamples = parseSpecificPdfFormat(text);
  if (specificFormatSamples.length > 0) {
    console.log('Found samples using specific format parser:', specificFormatSamples.length);
    samples.push(...specificFormatSamples);
  }
  
  // If no samples found with specific parser, try the general approach
  if (samples.length === 0) {
    // Look for "Sample Details" section - be more flexible with variations
    const sampleDetailsIndex = parts.findIndex(p => {
      const lower = p.toLowerCase();
      return lower.includes('sample details') || 
             lower.includes('sample information') ||
             lower.includes('equipment details') ||
             lower.includes('calibration details');
    });
  
  if (sampleDetailsIndex !== -1) {
    console.log('Found sample section at index:', sampleDetailsIndex);
    
    // Look for table headers after the sample section - be more flexible
    let headerIndex = -1;
    let headerKeywords = ['section', 'type', 'range', 'serial', 'price'];
    
    for (let i = sampleDetailsIndex + 1; i < Math.min(sampleDetailsIndex + 10, parts.length); i++) {
      const part = parts[i].toLowerCase();
      // Count how many header keywords are found in this line
      const keywordCount = headerKeywords.filter(keyword => part.includes(keyword)).length;
      
      // If we find at least 3 of the expected keywords, consider it a header
      if (keywordCount >= 3) {
        headerIndex = i;
        console.log('Found table headers at index:', headerIndex, 'with', keywordCount, 'keywords');
        break;
      }
    }
    
    if (headerIndex !== -1) {
      // Look for data rows after headers - be more comprehensive
      let dataIndex = headerIndex + 1;
      const sampleData = [];
      
      // Collect more lines and be less restrictive about stopping conditions
      while (dataIndex < parts.length && sampleData.length < 50) {
        const line = parts[dataIndex];
        if (line && line.trim() && line.length > 2) {
          // Skip obvious section headers but be less restrictive
          const lowerLine = line.toLowerCase();
          if (lowerLine.includes('section') && lowerLine.includes('information') ||
              lowerLine.includes('total') && lowerLine.includes('amount') ||
              lowerLine.includes('signature') || lowerLine.includes('date') ||
              lowerLine.includes('remarks') || lowerLine.includes('notes')) {
            // Stop if we hit a new major section
            break;
          }
          
          sampleData.push(line.trim());
        }
        dataIndex++;
      }
      
      console.log('Sample data lines found:', sampleData.length);
      console.log('Sample data lines:', sampleData.slice(0, 10)); // Show first 10 for debugging
      
      // Enhanced parsing strategies for different table formats
      for (const row of sampleData) {
        console.log('Processing row:', row);
        
        // Strategy 1: Split on 2+ spaces (most common for PDF tables)
        let cols = row.split(/\s{2,}/).map(c => c.trim()).filter(Boolean);
        
        // Strategy 2: If that doesn't work, try splitting on tabs
        if (cols.length < 3) {
          cols = row.split(/\t/).map(c => c.trim()).filter(Boolean);
        }
        
        // Strategy 3: Try splitting on single spaces but be smarter about grouping
        if (cols.length < 3) {
          const words = row.split(/\s+/);
          if (words.length >= 3) {
            // Enhanced grouping logic
            const grouped = [];
            let currentGroup = [];
            
            for (let i = 0; i < words.length; i++) {
              const word = words[i];
              
              // If this looks like a serial number, price, or range, it's probably its own column
              if (/^[A-Z0-9\-]{3,}$/i.test(word) || 
                  /^\d+(\.\d{2})?$/.test(word) ||
                  /^\d+\s*-\s*\d+/.test(word) ||
                  /^\d+\s*(g|kg|l|ml)$/i.test(word)) {
                if (currentGroup.length > 0) {
                  grouped.push(currentGroup.join(' '));
                  currentGroup = [];
                }
                grouped.push(word);
              } else {
                currentGroup.push(word);
              }
            }
            
            if (currentGroup.length > 0) {
              grouped.push(currentGroup.join(' '));
            }
            
            if (grouped.length >= 3) {
              cols = grouped;
            }
          }
        }
        
        // Strategy 4: If still not enough columns, try fixed-width parsing
        if (cols.length < 3 && row.length > 20) {
          // Try to parse as fixed-width columns (common in PDF tables)
          const fixedWidthCols = [];
          const colWidths = [20, 25, 20, 15, 10]; // Estimated column widths
          let start = 0;
          
          for (const width of colWidths) {
            const col = row.substring(start, start + width).trim();
            if (col) fixedWidthCols.push(col);
            start += width;
          }
          
          if (fixedWidthCols.length >= 3) {
            cols = fixedWidthCols;
          }
        }
        
        console.log('Parsed columns:', cols);
        
        if (cols.length >= 3) {
          // Enhanced column identification with more flexible patterns
          let sectionCol = '';
          let typeCol = '';
          let rangeCol = '';
          let serialCol = '';
          let priceCol = '';
          
          // Look for serial numbers (more flexible patterns)
          const serialIndex = cols.findIndex(col => 
            /[A-Z0-9\-]{3,}/i.test(col) || 
            /^[A-Z]{2,}\d{2,}/i.test(col) ||
            /RI-?\d{6,}-?[A-Z]{3}-?\d{3,}/i.test(col)
          );
          if (serialIndex !== -1) {
            serialCol = cols[serialIndex];
          }
          
          // Look for prices (more flexible patterns)
          const priceIndex = cols.findIndex(col => 
            /^\d+(\.\d{2})?$/.test(col) ||
            /^\d{1,3}(,\d{3})*(\.\d{2})?$/.test(col) ||
            /^\d+\.\d{2}$/.test(col)
          );
          if (priceIndex !== -1) {
            priceCol = cols[priceIndex];
          }
          
          // Look for ranges (more flexible patterns)
          const rangeIndex = cols.findIndex(col => 
            /(\d+\s*-\s*\d+\s*(g|kg|l|ml))|\d+\s*(g|kg|l|ml)/i.test(col) || 
            col.includes('-') || 
            /^\d+\s*to\s*\d+/i.test(col) ||
            /^\d+\s*and\s*below/i.test(col) ||
            /^\d+\s*L\s*to\s*\d+\s*L/i.test(col)
          );
          if (rangeIndex !== -1) {
            rangeCol = cols[rangeIndex];
          }
          
          // Look for equipment types (expanded patterns)
          const typeIndex = cols.findIndex(col => 
            /scale|thermometer|weight|tank|pump|sphygmomanometer|proving|measure|dispensing|tanker/i.test(col)
          );
          if (typeIndex !== -1) {
            typeCol = cols[typeIndex];
          }
          
          // Look for sections (expanded patterns)
          const sectionIndex = cols.findIndex(col => 
            /calibration|lab|standard|mass|volume|length|pressure|weighing|oiml/i.test(col)
          );
          if (sectionIndex !== -1) {
            sectionCol = cols[sectionIndex];
          }
          
          // If we couldn't identify specific columns, use positional assignment
          if (!sectionCol && cols.length >= 1) sectionCol = cols[0];
          if (!typeCol && cols.length >= 2) typeCol = cols[1];
          if (!rangeCol && cols.length >= 3) rangeCol = cols[2];
          if (!serialCol && cols.length >= 4) serialCol = cols[3];
          if (!priceCol && cols.length >= 5) priceCol = cols[4];

          // More flexible validation - accept rows that have meaningful content
          const hasSerial = /[A-Z0-9\-]{3,}/i.test(serialCol);
          const hasRange = /(\d+\s*-\s*\d+\s*(g|kg|l|ml))|\d+\s*(g|kg|l|ml)/i.test(rangeCol) || 
                          rangeCol.includes('-') || /^\d+\s*to\s*\d+/i.test(rangeCol);
          const hasPrice = /^(\d{1,3}(,\d{3})*|\d+)(\.\d{2})?$/.test(priceCol);
          const hasType = /scale|thermometer|weight|tank|pump|sphygmomanometer|proving|measure|dispensing|tanker/i.test(typeCol);
          const hasSection = /calibration|lab|standard|mass|volume|length|pressure|weighing|oiml/i.test(sectionCol);
          
          // Accept the row if it has at least 2 meaningful fields
          const meaningfulFields = [hasSerial, hasRange, hasPrice, hasType, hasSection].filter(Boolean).length;
          
          if (meaningfulFields >= 2 || (typeCol && sectionCol)) {
            const normalizedPrice = hasPrice ? priceCol.replace(/,/g, '') : '0';
            const sample = {
              section: sectionCol || '',
              type: typeCol || '',
              range: rangeCol || '',
              serialNo: serialCol || '',
              price: normalizedPrice,
              quantity: 1,
            };
            samples.push(sample);
            console.log('Sample created:', sample);
          } else {
            console.log('Row rejected - insufficient meaningful fields:', {
              hasSerial, hasRange, hasPrice, hasType, hasSection, meaningfulFields
            });
          }
        }
      }
    }
  }
  }
  
  // Enhanced fallback: try to extract any structured data from the entire text
  if (samples.length === 0) {
    console.log('No samples found in table parsing, trying enhanced fallback...');
    
    // Look for any lines that might contain sample data, even without clear table structure
    const potentialSampleLines = parts.filter(part => {
      const lower = part.toLowerCase();
      // Look for lines that contain equipment-related terms
      return (lower.includes('scale') || lower.includes('thermometer') || 
              lower.includes('weight') || lower.includes('tank') || 
              lower.includes('pump') || lower.includes('calibration') ||
              lower.includes('mass') || lower.includes('volume') ||
              lower.includes('length') || lower.includes('pressure')) &&
             part.length > 10; // Must be substantial content
    });
    
    console.log('Found potential sample lines:', potentialSampleLines.length);
    
    // Try to parse each potential sample line
    for (const line of potentialSampleLines) {
      console.log('Processing potential sample line:', line);
      
      // Try different parsing strategies
      let cols = line.split(/\s{2,}/).map(c => c.trim()).filter(Boolean);
      
      if (cols.length < 3) {
        cols = line.split(/\s+/).filter(Boolean);
      }
      
      if (cols.length >= 2) {
        // Try to identify what each column contains
        let sectionCol = '';
        let typeCol = '';
        let rangeCol = '';
        let serialCol = '';
        let priceCol = '';
        
        for (const col of cols) {
          // Check for section/calibration type
          if (/calibration|lab|standard|mass|volume|length|pressure|weighing|oiml/i.test(col)) {
            sectionCol = col;
          }
          // Check for equipment type
          else if (/scale|thermometer|weight|tank|pump|sphygmomanometer|proving|measure|dispensing|tanker/i.test(col)) {
            typeCol = col;
          }
          // Check for range/capacity
          else if (/(\d+\s*-\s*\d+\s*(g|kg|l|ml))|\d+\s*(g|kg|l|ml)/i.test(col) || 
                   col.includes('-') || /^\d+\s*to\s*\d+/i.test(col) ||
                   /^\d+\s*and\s*below/i.test(col)) {
            rangeCol = col;
          }
          // Check for serial number
          else if (/[A-Z0-9\-]{3,}/i.test(col) || /^[A-Z]{2,}\d{2,}/i.test(col)) {
            serialCol = col;
          }
          // Check for price
          else if (/^\d+(\.\d{2})?$/.test(col) || /^\d{1,3}(,\d{3})*(\.\d{2})?$/.test(col)) {
            priceCol = col;
          }
        }
        
        // If we couldn't identify specific columns, use positional assignment
        if (!sectionCol && cols.length >= 1) sectionCol = cols[0];
        if (!typeCol && cols.length >= 2) typeCol = cols[1];
        if (!rangeCol && cols.length >= 3) rangeCol = cols[2];
        if (!serialCol && cols.length >= 4) serialCol = cols[3];
        if (!priceCol && cols.length >= 5) priceCol = cols[4];
        
        // Create sample if we have meaningful content
        if (sectionCol || typeCol || rangeCol || serialCol) {
          const sample = {
            section: sectionCol || '',
            type: typeCol || '',
            range: rangeCol || '',
            serialNo: serialCol || '',
            price: priceCol ? priceCol.replace(/,/g, '') : '0',
            quantity: 1,
          };
          
          samples.push(sample);
          console.log('Fallback sample created:', sample);
        }
      }
    }
    
    // If still no samples, try comprehensive pattern matching
    if (samples.length === 0) {
      console.log('Trying comprehensive pattern matching...');
      
      const sectionPatterns = [
        /Weighing\s*Lab/i,
        /Mass\s*Calibration/i,
        /Volume\s*Calibration/i,
        /Calibration\s*of\s*Non-Automatic\s*Weighing\s*Instrument/i,
        /Length\s*Standards/i,
        /Thermometer\s*and\s*Hygrometer\s*Standards/i,
        /Pressure\s*Standard/i
      ];
      
      const typePatterns = [
        /Digital\s*Scale/i,
        /Analog\s*Scale/i,
        /Platform\s*Scale/i,
        /Weighing\s*Scale/i,
        /Thermometer/i,
        /Thermohygrometer/i,
        /Test\s*Weights/i,
        /Sphygmomanometer/i,
        /Proving\s*Tanks/i,
        /Test\s*Measure/i,
        /Fuel\s*Dispensing\s*Pump/i,
        /Road\s*Tankers/i
      ];
      
      const rangePatterns = [
        /\d+\s*-\s*\d+\s*(g|kg|l|ml)/i,
        /\d+\s*(g|kg|l|ml)/i,
        /\d+\s*to\s*\d+\s*(g|kg|l|ml)/i,
        /\d+\s*and\s*below/i,
        /\d+\s*to\s*\d+/i
      ];
      
      const serialPatterns = [
        /[A-Z]{1,4}-?\d{2,4}-?\d{2,4}/i,
        /[A-Z]{2,4}\d{3,6}/i,
        /RI-?\d{6,}-?[A-Z]{3}-?\d{3,}/i,
        /[A-Z0-9\-]{5,}/i
      ];
      
      const pricePatterns = [
        /(\d{1,3}(,\d{3})*|\d+)(\.\d{2})/,
        /\d+\.\d{2}/,
        /\d+/
      ];
      
      // Try to find matches for each pattern
      let sectionMatch = null;
      let typeMatch = null;
      let rangeMatch = null;
      let serialMatch = null;
      let priceMatch = null;
      
      for (const pattern of sectionPatterns) {
        const match = text.match(pattern);
        if (match) {
          sectionMatch = match;
          break;
        }
      }
      
      for (const pattern of typePatterns) {
        const match = text.match(pattern);
        if (match) {
          typeMatch = match;
          break;
        }
      }
      
      for (const pattern of rangePatterns) {
        const match = text.match(pattern);
        if (match) {
          rangeMatch = match;
          break;
        }
      }
      
      for (const pattern of serialPatterns) {
        const match = text.match(pattern);
        if (match) {
          serialMatch = match;
          break;
        }
      }
      
      for (const pattern of pricePatterns) {
        const match = text.match(pattern);
        if (match) {
          priceMatch = match;
          break;
        }
      }
      
      // If we found at least a serial number or some other identifying data, create a sample
      if (serialMatch || sectionMatch || typeMatch || rangeMatch || priceMatch) {
        const sample = {
          section: sectionMatch ? sectionMatch[0] : '',
          type: typeMatch ? typeMatch[0] : '',
          range: rangeMatch ? rangeMatch[0] : '',
          serialNo: serialMatch ? serialMatch[0] : '',
          price: priceMatch ? priceMatch[0] : '0',
          quantity: 1,
        };
        
        samples.push(sample);
        console.log('Pattern matching sample created:', sample);
      }
    }
  }

  const result = { client, address, schedule, samples, pdf_reference_number: pdfReferenceNumber };
  console.log('Final parsing result:', result);
  
  return result;
}
