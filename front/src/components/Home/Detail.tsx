import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Grid, Typography, Divider, Link } from '@mui/material';
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

function Detail() {
  const params = useParams();
  const [pdfdocs, setPdfDocs] = useState<pdfDoc[]>([])
  const [minutes, setMinutes] = useState<pdfDoc[]>([])

  useEffect(() => {
    axios.get('http://localhost:8065/search?id=' + params.id)
      .then(doc_res => {
        setPdfDocs(doc_res.data)
        const text = doc_res.data[0].text;
        axios.post('http://localhost:8065/minutes_search/', { text: text }).then(minute_res => {
          setMinutes(minute_res.data)
        })
      })
  }, [params])

  return (

    <Box sx={{ flexGrow: 1 }}>
      {pdfdocs.map(doc => {
        const img_base64 = `data:image/jpeg;base64,${doc.image}`;
        return (
          <Grid container key={doc.id} sx={{ p: 1 }}>
            <Grid item md={8} sx={{ p: 1 }}>
              <Typography variant="h4">{doc.filename} page:{doc.page}</Typography>
              <Typography component="div" variant="body2">{doc.text}</Typography>
            </Grid>
            <Grid item md={4} sx={{
              height: 500,
              backgroundImage: `url(${img_base64})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat'
            }} />
          </Grid>
        )
      })}
      <Divider sx={{ m: 1 }} />
      <Typography variant="h5">Recommended Minutes</Typography>
      {minutes.map(minute => {
        const img_base64 = `data:image/jpeg;base64,${minute.image}`;
        const file_path = `/media/minutes/${minute.filename}#page=${minute.page}`;
        return (
          <Grid container component="li" key={minute.id} sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
            <Grid item md={2} sx={{
              height: 300,
              backgroundImage: `url(${img_base64})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat'
            }} />
            <Grid item md={10} sx={{ px: 2 }}>
              <Typography variant="h5">{minute.filename} page:{minute.page}</Typography>
              <Typography variant="h6">score:{minute.score}</Typography>
              <Link href={file_path} target="_blank" rel="noopener">{minute.path}</Link>
            </Grid>
          </Grid>
        )
      })}
    </Box>
  )
}
export { Detail }