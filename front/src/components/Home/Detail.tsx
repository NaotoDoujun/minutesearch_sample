import * as React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Grid, Typography, Divider, Link, Chip } from '@mui/material';
import axios from 'axios';
import { AppSettingsContext } from '../Common';
import { pdfDocs } from '../../types'

function Detail() {
  const params = useParams();
  const { recommendsSize } = React.useContext(AppSettingsContext);
  const [pdfdocs, setPdfDocs] = React.useState<pdfDocs>({ total: { value: 0, relation: '' }, hits: [] })
  const [minutes, setMinutes] = React.useState<pdfDocs>({ total: { value: 0, relation: '' }, hits: [] })

  React.useEffect(() => {
    axios.get(`${process.env.REACT_APP_APPAPI_HOST}/search?id=` + params.id)
      .then(doc_res => {
        setPdfDocs(doc_res.data)
        // input document's text
        const text = doc_res.data.hits[0].text;
        axios.post(`${process.env.REACT_APP_APPAPI_HOST}/minutes_search/?size=${recommendsSize}`, { text: text })
          .then(minute_res => {
            setMinutes(minute_res.data)
          })
          .catch(err => {
            console.log('err:', err);
          })
      })
      .catch(err => {
        console.log('err:', err);
      })
  }, [params, recommendsSize]);

  return (
    <Box sx={{ flexGrow: 1 }}>
      {pdfdocs.hits.map(doc => {
        const img_base64 = `data:image/jpeg;base64,${doc.image}`;
        return (
          <Grid container key={doc.id} sx={{ p: 1 }}>
            <Grid item md={8} sx={{ p: 1 }}>
              <Typography variant="h4">{doc.filename} page:{doc.page}</Typography>
              <Typography component="div" variant="body2">{doc.text}</Typography>
              <Grid>
                {doc.tags.map(tag => { return <Chip key={tag} sx={{ m: 1 }} label={tag} /> })}
              </Grid>
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
      {minutes.hits.map(minute => {
        const img_base64 = `data:image/jpeg;base64,${minute.image}`;
        const file_path = `/media/${process.env.REACT_APP_MINUTE_DIR_NAME}/${minute.filename}#page=${minute.page}`;
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
              <Grid>
                {minute.tags.map(tag => { return <Chip key={tag} sx={{ m: 1 }} label={tag} /> })}
              </Grid>
              <Link href={file_path} target="_blank" rel="noopener">{minute.path}</Link>
            </Grid>
          </Grid>
        )
      })}
    </Box>
  );
};
export { Detail };