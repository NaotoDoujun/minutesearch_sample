import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Grid, Typography, Link as MuiLink, Pagination } from '@mui/material';
import axios from 'axios';
import { pdfDocs } from '../../types'

function Results() {
  const [pdfdocs, setPdfDocs] = useState<pdfDocs>({ total: { value: 0, relation: '' }, hits: [] })
  const [count, setCount] = useState(1)
  const [page, setPage] = useState(1)
  const size = 10

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_APPAPI_HOST}/search?size=${size}`)
      .then(res => {
        setPdfDocs(res.data)
        const total = res.data.total.value
        if (total > 0) setCount(Math.ceil(total / size))
      })
      .catch(err => {
        console.log('err:', err);
      });
  }, [])

  const handlePageChange = (e: React.ChangeEvent<unknown>, page: number) => {
    setPage(page)
    const start = size * (page - 1)
    axios.get(`${process.env.REACT_APP_APPAPI_HOST}/search?size=${size}&start=${start}`)
      .then(res => {
        setPdfDocs(res.data)
      })
      .catch(err => {
        console.log('err:', err);
      });
  }

  return (
    <>
      {pdfdocs.hits.map(doc => {
        const img_base64 = `data:image/jpeg;base64,${doc.image}`;
        const file_path = `/media/${process.env.REACT_APP_INPUT_DIR_NAME}/${doc.filename}#page=${doc.page}`;
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
      <div style={{ textAlign: 'center', padding: '1em' }} >
        {pdfdocs.hits.length > 0 ? <Pagination sx={{ display: 'inline-block' }} count={count} page={page} onChange={handlePageChange} /> : <></>}
      </div>
    </>
  )
}
export { Results }