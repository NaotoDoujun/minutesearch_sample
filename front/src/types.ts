type total = {
  value: number;
  relation: string
}

type pdfDoc = {
  id: string;
  page: number;
  text: string;
  tags: string[];
  image: string;
  filename: string;
  path: string;
  score: number;
};

export type pdfDocs = {
  total: total;
  hits: pdfDoc[]
}