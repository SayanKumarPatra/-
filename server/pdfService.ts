import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import { PDF_STORAGE_DIR, db } from './db';

/**
 * PDF Service for BCA STUDY POINT
 * - Generates verified seed BCA question banks if missing
 * - Authorizes page requests
 * - Bakes personalized watermarks into individual served pages
 * - Never exposes raw un-watermarked source files
 */

export class PdfService {
  constructor() {
    this.ensureStorage();
  }

  private ensureStorage() {
    if (!fs.existsSync(PDF_STORAGE_DIR)) {
      fs.mkdirSync(PDF_STORAGE_DIR, { recursive: true });
    }
  }

  /**
   * Initializes real seed question bank PDF files for pre-configured BCA subjects
   */
  async initializeSeedPdfs() {
    const products = db.getProducts();
    for (const product of products) {
      const fullPath = path.join(PDF_STORAGE_DIR, path.basename(product.privateStoragePath));
      if (!fs.existsSync(fullPath)) {
        console.log(`Generating seed PDF question bank for ${product.subjectCode}...`);
        await this.generateSampleQuestionBankPdf(product, fullPath);
      } else {
        const actualCount = await this.inspectPdfPageCount(fullPath);
        if (product.pageCount !== actualCount && actualCount > 0) {
          db.updateProduct(product.id, { pageCount: actualCount });
        }
      }
    }
  }

  /**
   * Generates a multi-page comprehensive BCA Question Bank PDF with authentic exam content
   */
  private async generateSampleQuestionBankPdf(product: any, destPath: string) {
    const pdfDoc = await PDFDocument.create();
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const courier = await pdfDoc.embedFont(StandardFonts.Courier);

    const pagesContent = this.getSubjectExamContent(product.subjectCode, product.subjectName);

    for (let i = 0; i < pagesContent.length; i++) {
      const pageData = pagesContent[i];
      const page = pdfDoc.addPage([595.28, 841.89]); // Standard A4 points
      const { width, height } = page.getSize();

      // Top Header Banner
      page.drawRectangle({
        x: 30,
        y: height - 60,
        width: width - 60,
        height: 35,
        color: rgb(0.1, 0.25, 0.65), // Royal blue
      });

      page.drawText('BCA STUDY POINT  -  OFFICIAL EXAM QUESTION BANK', {
        x: 45,
        y: height - 42,
        size: 11,
        font: helveticaBold,
        color: rgb(1, 1, 1),
      });

      page.drawText('STRICTLY CONFIDENTIAL  |  STUDENT LICENSED COPY', {
        x: width - 260,
        y: height - 42,
        size: 8,
        font: helvetica,
        color: rgb(0.85, 0.9, 1),
      });

      // Subject Bar
      page.drawText(`${product.subjectCode}: ${product.subjectName.toUpperCase()}`, {
        x: 35,
        y: height - 85,
        size: 13,
        font: helveticaBold,
        color: rgb(0.08, 0.15, 0.35),
      });

      page.drawText(`Edition: ${product.examYear}  |  University Syllabus Aligned Solved Bank`, {
        x: 35,
        y: height - 100,
        size: 9,
        font: helvetica,
        color: rgb(0.4, 0.45, 0.5),
      });

      // Divider
      page.drawLine({
        start: { x: 35, y: height - 110 },
        end: { x: width - 35, y: height - 110 },
        thickness: 1,
        color: rgb(0.8, 0.85, 0.9),
      });

      // Page Title
      page.drawText(pageData.sectionTitle, {
        x: 35,
        y: height - 135,
        size: 12,
        font: helveticaBold,
        color: rgb(0.12, 0.3, 0.7),
      });

      // Question blocks
      let currentY = height - 165;
      for (const q of pageData.questions) {
        if (currentY < 120) break;

        // Question tag
        page.drawText(`[ ${q.marks} MARKS ]`, {
          x: 35,
          y: currentY,
          size: 8,
          font: helveticaBold,
          color: rgb(0.8, 0.2, 0.1),
        });

        page.drawText(q.title, {
          x: 95,
          y: currentY,
          size: 10,
          font: helveticaBold,
          color: rgb(0.1, 0.12, 0.18),
        });

        currentY -= 18;

        // Solution lines
        for (const line of q.solution) {
          if (currentY < 90) break;
          const isCode = line.startsWith('  ') || line.includes(';') || line.includes('{');
          page.drawText(line, {
            x: isCode ? 45 : 35,
            y: currentY,
            size: isCode ? 8 : 8.5,
            font: isCode ? courier : helvetica,
            color: isCode ? rgb(0.05, 0.3, 0.2) : rgb(0.2, 0.22, 0.25),
          });
          currentY -= 14;
        }

        currentY -= 12;

        // Light separator between questions
        page.drawLine({
          start: { x: 35, y: currentY + 6 },
          end: { x: width - 35, y: currentY + 6 },
          thickness: 0.5,
          color: rgb(0.9, 0.92, 0.95),
        });
        currentY -= 8;
      }

      // Footer
      page.drawLine({
        start: { x: 35, y: 45 },
        end: { x: width - 35, y: 45 },
        thickness: 0.5,
        color: rgb(0.8, 0.85, 0.9),
      });

      page.drawText(`BCA STUDY POINT  *  Page ${i + 1} of ${pagesContent.length}`, {
        x: 35,
        y: 30,
        size: 8,
        font: helvetica,
        color: rgb(0.5, 0.55, 0.6),
      });

      page.drawText('All Rights Reserved. Device bound digital access only. Unauthorized distribution is prohibited.', {
        x: width - 340,
        y: 30,
        size: 7,
        font: helvetica,
        color: rgb(0.6, 0.65, 0.7),
      });
    }

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(destPath, pdfBytes);
  }

  /**
   * Generates a single, personalized watermarked page from the protected PDF
   * Returns PDF binary of JUST that page with the student watermark permanently embedded
   */
  async getWatermarkedPagePdf(params: {
    privateStoragePath: string;
    pageNumber: number; // 1-indexed
    studentName: string;
    studentEmail: string;
    orderId: string;
    timestamp: string;
  }): Promise<{ pdfBytes: Uint8Array; totalPages: number }> {
    const fullPath = path.join(PDF_STORAGE_DIR, path.basename(params.privateStoragePath));
    if (!fs.existsSync(fullPath)) {
      throw new Error(`PDF file not found in private storage: ${params.privateStoragePath}`);
    }

    const sourceBytes = fs.readFileSync(fullPath);
    const sourceDoc = await PDFDocument.load(sourceBytes);
    const totalPages = sourceDoc.getPageCount();

    // Safely clamp requested page into legitimate bounds [1, totalPages]
    const safePageNumber = Math.max(1, Math.min(params.pageNumber, totalPages));

    // Create a new single-page document for maximum security
    const pageDoc = await PDFDocument.create();
    const [copiedPage] = await pageDoc.copyPages(sourceDoc, [safePageNumber - 1]);
    pageDoc.addPage(copiedPage);

    const helveticaBold = await pageDoc.embedFont(StandardFonts.HelveticaBold);
    const { width, height } = copiedPage.getSize();

    // Clean, high-traceability diagonal watermark text
    const watermarkText = `BCA STUDY POINT  |  LICENSED TO: ${params.studentName.toUpperCase()}  |  ${params.studentEmail}  |  ORDER: ${params.orderId}  |  ${params.timestamp}`;

    // Draw repeating diagonal watermarks across the page
    const yOffsets = [height * 0.25, height * 0.5, height * 0.75];
    for (const yOffset of yOffsets) {
      copiedPage.drawText(watermarkText, {
        x: 40,
        y: yOffset,
        size: 8.5,
        font: helveticaBold,
        color: rgb(0.15, 0.3, 0.75),
        opacity: 0.16, // Semi-transparent, completely legible, highly identifiable
        rotate: degrees(32),
      });
    }

    // Also draw a bottom security banner
    copiedPage.drawRectangle({
      x: 35,
      y: 50,
      width: width - 70,
      height: 14,
      color: rgb(0.95, 0.97, 1),
      borderColor: rgb(0.7, 0.8, 0.95),
      borderWidth: 0.5,
      opacity: 0.85,
    });

    copiedPage.drawText(
      `SECURE VIEWER COPY: ${params.studentEmail} (ORDER #${params.orderId}) - DO NOT SHARE`,
      {
        x: 42,
        y: 54,
        size: 6.5,
        font: helveticaBold,
        color: rgb(0.2, 0.35, 0.7),
      }
    );

    const watermarkedBytes = await pageDoc.save();
    return {
      pdfBytes: watermarkedBytes,
      totalPages,
    };
  }

  /**
   * Inspect page count of a PDF file
   */
  async inspectPdfPageCount(filePath: string): Promise<number> {
    try {
      const bytes = fs.readFileSync(filePath);
      const doc = await PDFDocument.load(bytes);
      return doc.getPageCount();
    } catch {
      return 1;
    }
  }

  /**
   * Authentic university BCA question bank content generator
   */
  private getSubjectExamContent(subjectCode: string, subjectName: string) {
    if (subjectCode.includes('101')) {
      return [
        {
          sectionTitle: 'UNIT 1: C PROGRAMMING FUNDAMENTALS & POINTER MECHANICS',
          questions: [
            {
              marks: 10,
              title: 'Q1. Explain Pointers and Dynamic Memory Allocation with syntax & diagrams.',
              solution: [
                'Answer: A pointer is a variable that stores the memory address of another variable.',
                'Dynamic memory functions in <stdlib.h> include malloc(), calloc(), realloc(), and free().',
                'Code Demonstration:',
                '  int *ptr = (int*) malloc(5 * sizeof(int));',
                '  if (ptr == NULL) { printf("Memory allocation failed\\n"); exit(1); }',
                '  for (int i=0; i<5; i++) { *(ptr + i) = (i + 1) * 10; }',
                '  printf("Value at index 2: %d\\n", *(ptr + 2)); // Outputs 30',
                '  free(ptr); // Mandatory to prevent memory leak',
                'Key Differences: malloc() leaves memory uninitialized (garbage values), while',
                'calloc() initializes all bytes to zero and accepts (num_elements, element_size).',
              ],
            },
            {
              marks: 5,
              title: 'Q2. Differentiate between Call by Value and Call by Reference with swap example.',
              solution: [
                'Answer: In Call by Value, a copy of the argument is passed. Changes inside the function',
                'do not reflect in caller. In Call by Reference, addresses are passed using pointers.',
                '  void swap(int *a, int *b) { int temp = *a; *a = *b; *b = temp; }',
                'Call: swap(&x, &y); Result: Original x and y values are swapped successfully.',
              ],
            },
            {
              marks: 5,
              title: 'Q3. What is recursion? Write a recursive program to solve Tower of Hanoi.',
              solution: [
                'Answer: Recursion occurs when a function calls itself to solve a smaller subproblem.',
                '  void tower(int n, char from, char to, char aux) {',
                '    if (n == 1) { printf("Move disk 1 from %c to %c\\n", from, to); return; }',
                '    tower(n-1, from, aux, to);',
                '    printf("Move disk %d from %c to %c\\n", n, from, to);',
                '    tower(n-1, aux, to, from);',
                '  }',
                'Time Complexity: T(n) = 2T(n-1) + 1 => O(2^n). Total moves required: 2^n - 1.',
              ],
            },
          ],
        },
        {
          sectionTitle: 'UNIT 2: STRUCTURES, UNIONS & FILE INPUT/OUTPUT EXAM BANK',
          questions: [
            {
              marks: 10,
              title: 'Q4. Distinguish between Structure and Union with memory allocation diagram.',
              solution: [
                'Answer: Structures allocate distinct memory addresses for every member simultaneously.',
                'Unions share one common memory pool equal to the size of its largest member.',
                '  struct Student { int roll; char name[20]; float marks; }; // Size = 4 + 20 + 4 = 28 bytes',
                '  union Data { int roll; char name[20]; float marks; }; // Size = 20 bytes (largest member)',
                'Important Viva Question: Union can only hold one active valid value at any given time.',
              ],
            },
            {
              marks: 10,
              title: 'Q5. Write a complete C program to copy one text file into another character by character.',
              solution: [
                'Answer:',
                '  FILE *fs = fopen("source.txt", "r");',
                '  FILE *ft = fopen("target.txt", "w");',
                '  if (fs == NULL || ft == NULL) { printf("File error\\n"); exit(1); }',
                '  int ch;',
                '  while ((ch = fgetc(fs)) != EOF) { fputc(ch, ft); }',
                '  fclose(fs); fclose(ft); printf("File copied successfully.\\n");',
              ],
            },
          ],
        },
        {
          sectionTitle: 'UNIT 3: PREVIOUS YEAR 10-MARK FREQUENT LONG QUESTIONS',
          questions: [
            {
              marks: 10,
              title: 'Q6. Explain Storage Classes in C: auto, extern, static, and register with scope & lifetime.',
              solution: [
                '1. auto: Local scope, function lifetime, stored in stack frame (default for local vars).',
                '2. register: Local scope, function lifetime, stored in CPU register for high-speed loops.',
                '3. static: Local or file scope, program lifetime, retains previous value between calls.',
                '4. extern: Global scope, program lifetime, declared across multiple compilation files.',
              ],
            },
            {
              marks: 5,
              title: 'Q7. What are Preprocessor Directives? Explain #define and conditional compilation.',
              solution: [
                'Answer: Lines starting with # are processed before compilation by the C preprocessor.',
                'Examples: #define PI 3.14159, #ifdef DEBUG ... #endif for debugging flags.',
              ],
            },
          ],
        },
      ];
    } else if (subjectCode.includes('201')) {
      return [
        {
          sectionTitle: 'UNIT 1: LINKED LISTS & STACK APPLICATIONS (SOLVED BANK)',
          questions: [
            {
              marks: 10,
              title: 'Q1. Write an algorithm to reverse a Singly Linked List in O(n) time and O(1) space.',
              solution: [
                'Algorithm: Maintain three pointers: prev = NULL, curr = head, next = NULL.',
                '  struct Node* reverseList(struct Node* head) {',
                '    struct Node *prev = NULL, *curr = head, *next = NULL;',
                '    while (curr != NULL) {',
                '      next = curr->next;  // Save next node',
                '      curr->next = prev;  // Reverse current node link',
                '      prev = curr;        // Move prev forward',
                '      curr = next;        // Move curr forward',
                '    }',
                '    return prev; // New head of reversed list',
                '  }',
              ],
            },
            {
              marks: 10,
              title: 'Q2. Convert the Infix expression (A + B) * (C - D) / E to Postfix using Stack.',
              solution: [
                'Input Symbol | Stack Content | Output String',
                '(            | (             | empty',
                'A            | (             | A',
                '+            | (+            | A',
                'B            | (+            | A B',
                ')            | empty         | A B +',
                '*            | *             | A B +',
                '(            | *(            | A B +',
                'C            | *(            | A B + C',
                '-            | *(-           | A B + C',
                'D            | *(-           | A B + C D',
                ')            | *             | A B + C D -',
                '/            | /             | A B + C D - *',
                'E            | /             | A B + C D - * E',
                'End of Expr  | empty         | A B + C D - * E /',
                'Final Postfix Expression: A B + C D - * E /',
              ],
            },
          ],
        },
        {
          sectionTitle: 'UNIT 2: TREES, AVL ROTATIONS & BINARY SEARCH TREES',
          questions: [
            {
              marks: 10,
              title: 'Q3. Explain AVL Tree Rotations (LL, RR, LR, RL) with balancing factor calculation.',
              solution: [
                'Balance Factor BF = height(left_subtree) - height(right_subtree). Valid values: {-1, 0, 1}.',
                '1. LL Rotation: Right single rotation when insertion is in left child of left subtree.',
                '2. RR Rotation: Left single rotation when insertion is in right child of right subtree.',
                '3. LR Rotation: Left rotation on child followed by Right rotation on root.',
                '4. RL Rotation: Right rotation on child followed by Left rotation on root.',
                'AVL trees guarantee strict O(log n) worst-case search, insert, and delete operations.',
              ],
            },
          ],
        },
      ];
    } else {
      return [
        {
          sectionTitle: `EXAM QUESTION BANK: ${subjectName.toUpperCase()}`,
          questions: [
            {
              marks: 10,
              title: 'Q1. Comprehensive Overview of Core Concepts and Architectural Principles.',
              solution: [
                `Answer: This question bank is thoroughly calibrated for the ${subjectName} exam.`,
                'Key topics include theoretical foundations, practical problem-solving algorithms,',
                'step-by-step mathematical proofs, and standard university viva voce questions.',
                'Always structure your 10-mark answers with: (1) Definition, (2) Diagram/Architecture,',
                '(3) Mathematical formula or code snippet, (4) Real-world example, (5) Pros and Cons.',
              ],
            },
            {
              marks: 10,
              title: 'Q2. Solve the standard university model problem with detailed explanations.',
              solution: [
                'Step 1: Identify all given input parameters and boundary conditions.',
                'Step 2: State governing theorems, algorithmic invariants, and assumptions.',
                'Step 3: Execute step-by-step state transitions or tabular derivations.',
                'Step 4: Verify outputs against known edge cases and derive asymptotic complexity.',
              ],
            },
            {
              marks: 5,
              title: 'Q3. Compare and contrast alternative paradigms in semester exams.',
              solution: [
                'Provide clear comparison tables covering definition, efficiency, space cost,',
                'implementation difficulty, and appropriate industry use cases.',
              ],
            },
          ],
        },
        {
          sectionTitle: 'FREQUENTLY ASKED 5-MARK SHORT ANSWER QUESTIONS',
          questions: [
            {
              marks: 5,
              title: 'Q4. Short Notes on Critical Design Trade-Offs and Optimization Techniques.',
              solution: [
                '1. Memory vs Computational Latency trade-offs in modern computing stacks.',
                '2. Security considerations and common vulnerabilities highlighted in university syllabi.',
                '3. Best practices for clean documentation and modular algorithmic solutions.',
              ],
            },
          ],
        },
      ];
    }
  }
}

export const pdfService = new PdfService();
