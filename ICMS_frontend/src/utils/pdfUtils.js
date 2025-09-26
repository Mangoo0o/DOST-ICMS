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
  
  // Split by common delimiters and clean up
  const parts = text.split(/[\n\r]+|●|•/).map(p => normalize(p)).filter(Boolean);
  console.log('Split parts count:', parts.length);
  console.log('Parts preview:', parts.slice(0, 10));

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

  // Simplified sample details parsing for the actual 5-column table structure
  const samples = [];
  console.log('Starting sample parsing...');
  
  // Look for "Sample Details" section
  const sampleDetailsIndex = parts.findIndex(p => 
    p.toLowerCase().includes('sample details')
  );
  
  if (sampleDetailsIndex !== -1) {
    console.log('Found "Sample Details" section at index:', sampleDetailsIndex);
    
    // Look for table headers after "Sample Details"
    let headerIndex = -1;
    for (let i = sampleDetailsIndex + 1; i < parts.length; i++) {
      const part = parts[i].toLowerCase();
      // Look for the exact headers from your table
      if (part.includes('section') && part.includes('type') && part.includes('range') && 
          (part.includes('serial no') || part.includes('serial')) && part.includes('price')) {
        headerIndex = i;
        console.log('Found table headers at index:', headerIndex);
        break;
      }
    }
    
    if (headerIndex !== -1) {
      // Look for data rows after headers
      let dataIndex = headerIndex + 1;
      const sampleData = [];
      
      // Collect the next few lines as potential data
      while (dataIndex < parts.length && sampleData.length < 25) {
        const line = parts[dataIndex];
        if (line && line.trim() && line.length > 3) {
          // Skip if it's another section header
          if (line.toLowerCase().includes('section') || 
              line.toLowerCase().includes('details') ||
              line.toLowerCase().includes('information')) {
            dataIndex++;
            continue;
          }
          
          sampleData.push(line.trim());
        }
        dataIndex++;
      }
      
      console.log('Sample data lines found:', sampleData);
      
      // Try multiple parsing strategies for different table formats
      for (const row of sampleData) {
        console.log('Processing row:', row);
        
        // Strategy 1: Split on 2+ spaces (original approach)
        let cols = row.split(/\s{2,}/).map(c => c.trim()).filter(Boolean);
        
        // Strategy 2: If that doesn't work, try splitting on tabs
        if (cols.length < 3) {
          cols = row.split(/\t/).map(c => c.trim()).filter(Boolean);
        }
        
        // Strategy 3: If still not enough columns, try splitting on single spaces but be more careful
        if (cols.length < 3) {
          // Look for patterns that might indicate column boundaries
          const words = row.split(/\s+/);
          if (words.length >= 3) {
            // Try to group words that look like they belong together
            const grouped = [];
            let currentGroup = [];
            
            for (let i = 0; i < words.length; i++) {
              const word = words[i];
              // If this looks like a serial number or price, it's probably its own column
              if (/^[A-Z0-9\-]{3,}$/i.test(word) || /^\d+(\.\d{2})?$/.test(word)) {
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
        
        console.log('Parsed columns:', cols);
        
        if (cols.length >= 3) {
          // Try different column orders based on content
          let sectionCol = '';
          let typeCol = '';
          let rangeCol = '';
          let serialCol = '';
          let priceCol = '';
          
          // Look for serial numbers (usually contain letters and numbers)
          const serialIndex = cols.findIndex(col => /[A-Z0-9\-]{3,}/i.test(col));
          if (serialIndex !== -1) {
            serialCol = cols[serialIndex];
          }
          
          // Look for prices (usually numbers with optional decimal)
          const priceIndex = cols.findIndex(col => /^\d+(\.\d{2})?$/.test(col));
          if (priceIndex !== -1) {
            priceCol = cols[priceIndex];
          }
          
          // Look for ranges (usually contain numbers and units or dashes)
          const rangeIndex = cols.findIndex(col => 
            /(\d+\s*-\s*\d+\s*(g|kg|l|ml))|\d+\s*(g|kg|l|ml)/i.test(col) || 
            col.includes('-') || 
            /^\d+\s*to\s*\d+/i.test(col)
          );
          if (rangeIndex !== -1) {
            rangeCol = cols[rangeIndex];
          }
          
          // Look for equipment types (usually contain common equipment words)
          const typeIndex = cols.findIndex(col => 
            /scale|thermometer|weight|tank|pump|sphygmomanometer/i.test(col)
          );
          if (typeIndex !== -1) {
            typeCol = cols[typeIndex];
          }
          
          // Look for sections (usually contain calibration or lab terms)
          const sectionIndex = cols.findIndex(col => 
            /calibration|lab|standard|mass|volume|length|pressure/i.test(col)
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

          // Filter out lines that are obviously not data rows
          const looksLikeSerial = /[A-Z0-9\-]{3,}/i.test(serialCol);
          const looksLikeRange = /(\d+\s*-\s*\d+\s*(g|kg|l|ml))|\d+\s*(g|kg|l|ml)/i.test(rangeCol) || rangeCol.includes('-');
          const looksLikePrice = /^(\d{1,3}(,\d{3})*|\d+)(\.\d{2})?$/.test(priceCol);

          if (looksLikeSerial || looksLikeRange || looksLikePrice || (typeCol && sectionCol)) {
            const normalizedPrice = looksLikePrice ? priceCol.replace(/,/g, '') : '';
            const sample = {
              section: sectionCol || '',
              type: typeCol || '',
              range: rangeCol || '',
              serialNo: serialCol || '',
              price: normalizedPrice || '0',
              quantity: 1,
            };
            samples.push(sample);
            console.log('Sample created:', sample);
          }
        }
      }
    }
  }
  
  // Fallback: try to extract any structured data from the entire text
  if (samples.length === 0) {
    console.log('No samples found in table parsing, trying fallback...');
    
    // More comprehensive pattern matching for different PDF formats
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
      console.log('Fallback sample created:', sample);
    }
  }

  const result = { client, address, schedule, samples, pdf_reference_number: pdfReferenceNumber };
  console.log('Final parsing result:', result);
  
  return result;
}
