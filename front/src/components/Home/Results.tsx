import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Grid, Typography, Link as MuiLink } from '@mui/material';
import axios from 'axios';

type pdfDoc = {
  id: string;
  page: number;
  text: string;
  image: string;
  filename: string;
  path: string;
  score: number;
};

function Results() {
  const [pdfdocs, setPdfDocs] = useState<pdfDoc[]>([])

  useEffect(() => {
    axios.get('http://localhost:8065/search')
      .then(res => {
        setPdfDocs(res.data)
      })
  }, [])

  return (
    <>
      {pdfdocs.map(doc => {
        const img_base64 = `data:image/jpeg;base64,${doc.image}`;
        const file_path = `/media/inputs/${doc.filename}#page=${doc.page}`;
        return (
          <Grid container component="li"
            key={doc.id}
            sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
            <Grid item md={2} sx={{
              height: 300,
              backgroundImage: `url(${img_base64})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat'
            }} />
            <Grid item md={10} sx={{ px: 2 }}>
              <Link to={'/detail/' + doc.id}><Typography variant="h5">{doc.filename} page:{doc.page}</Typography></Link>
              <Typography component="div" variant="body2">{doc.text}</Typography>
              <MuiLink href={file_path} target="_blank" rel="noopener">{doc.path}</MuiLink>
            </Grid>
          </Grid>
        )
      })}
    </>
  )
}
export { Results }