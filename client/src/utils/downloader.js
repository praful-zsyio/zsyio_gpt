import { jsPDF } from 'jspdf';

/**
 * Download raw blob or file from URL
 */
export async function downloadFile(url, filename) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  } catch (err) {
    // Fallback direct link
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

/**
 * Convert and download image to PNG, JPEG, WebP or PDF
 */
export async function downloadImageAs(imageUrl, format, baseName = 'zsyiogpt_image') {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      if (format === 'pdf') {
        const orientation = canvas.width > canvas.height ? 'landscape' : 'portrait';
        const pdf = new jsPDF({
          orientation,
          unit: 'px',
          format: [canvas.width, canvas.height],
        });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
        pdf.save(`${baseName}.pdf`);
        resolve();
        return;
      }

      let mimeType = 'image/png';
      let extension = 'png';
      let quality = 0.95;

      if (format === 'jpeg' || format === 'jpg') {
        mimeType = 'image/jpeg';
        extension = 'jpg';
      } else if (format === 'webp') {
        mimeType = 'image/webp';
        extension = 'webp';
      }

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas blob conversion failed'));
            return;
          }
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = `${baseName}.${extension}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(blobUrl);
          resolve();
        },
        mimeType,
        quality
      );
    };
    img.onerror = () => {
      // Fallback direct download
      downloadFile(imageUrl, `${baseName}.${format === 'pdf' ? 'pdf' : format}`);
      resolve();
    };
    img.src = imageUrl;
  });
}

/**
 * Export chat transcript in PDF, Markdown, TXT, or JSON
 */
export function exportChatTranscript(messages, format = 'md', title = 'Chat Session') {
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `zsyiogpt_chat_${dateStr}.${format}`;

  if (format === 'json') {
    const jsonStr = JSON.stringify(messages, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    downloadBlob(blob, filename);
    return;
  }

  if (format === 'txt') {
    let txt = `=== ZSYIOGPT CHAT TRANSCRIPT: ${title} ===\nDate: ${new Date().toLocaleString()}\n\n`;
    messages.forEach((m) => {
      const role = m.role === 'user' ? 'USER' : 'ASSISTANT';
      txt += `[${role} - ${new Date(m.createdAt || Date.now()).toLocaleTimeString()}]:\n${m.content}\n\n------------------------\n\n`;
    });
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, filename);
    return;
  }

  if (format === 'md') {
    let md = `# ZsyioGPT Chat Transcript: ${title}\n**Export Date:** ${new Date().toLocaleString()}\n\n---\n\n`;
    messages.forEach((m) => {
      const isUser = m.role === 'user';
      md += `### ${isUser ? '👤 User' : '🤖 Assistant'} \n${m.content}\n\n---\n\n`;
    });
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    downloadBlob(blob, filename);
    return;
  }

  if (format === 'pdf') {
    const doc = new jsPDF();
    doc.setFillColor(10, 14, 22);
    doc.rect(0, 0, 210, 297, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(0, 242, 254);
    doc.text(`ZsyioGPT Transcript: ${title}`, 15, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(160, 175, 200);
    doc.text(`Generated on ${new Date().toLocaleString()}`, 15, 27);

    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.2);
    doc.line(15, 32, 195, 32);

    let y = 42;
    doc.setFontSize(10);

    messages.forEach((m) => {
      if (y > 270) {
        doc.addPage();
        doc.setFillColor(10, 14, 22);
        doc.rect(0, 0, 210, 297, 'F');
        y = 20;
      }

      const isUser = m.role === 'user';
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(isUser ? 0 : 138, isUser ? 242 : 43, isUser ? 254 : 226);
      doc.text(isUser ? 'USER:' : 'ASSISTANT:', 15, y);
      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(220, 230, 245);
      const lines = doc.splitTextToSize(m.content || '', 180);
      doc.text(lines, 15, y);
      y += lines.length * 5 + 8;
    });

    doc.save(`zsyiogpt_chat_${dateStr}.pdf`);
  }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
