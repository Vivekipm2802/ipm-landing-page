import { Pagination } from 'swiper';
import styles from './Paginator.module.css';
import { useState } from 'react';
import { useEffect } from 'react';
import Link from 'next/link';


function Paginator({items, itemsPerPage, renderFunction,count,pagenumber }){
   /*  const [currentPage, setCurrentPage] = useState(1);
    const [paginatedItems, setPaginatedItems] = useState([]); */
  
    /* useEffect(() => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const itemsToShow = items.slice(startIndex, endIndex);
  
      setPaginatedItems(itemsToShow);
    }, [items, currentPage, itemsPerPage]); */
  
 /*    const handlePageChange = (newPage) => {
      setCurrentPage(newPage);
    }; */
  
    return (<>
      <div className={styles.gridr}>
        {items.map((item, index) => (
          <>{renderFunction(item)}</>
        ))}
  
   
      </div>
        <div className={styles.paginate}>
     <Link href={`/blogs?pg=${pagenumber && pagenumber > 0 ? pagenumber - 1 : 0}`}>   <div disabled={pagenumber && pagenumber > 0 ? false : true} className={styles.prev}><svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M15.707 4.293a1 1 0 0 1 0 1.414L9.414 12l6.293 6.293a1 1 0 0 1-1.414 1.414l-7-7a1 1 0 0 1 0-1.414l7-7a1 1 0 0 1 1.414 0Z" fill="#000"/></svg></div></Link>
        {items && count &&
            Array(Math.round(count/15)).fill().map((i,d)=>{
                return <Link href={`/blogs?pg=${d}`}><div className={styles.page + " " + (d == pagenumber ?styles.pagination_active :'' )}>{d+1}</div></Link>
            })
        }
       <Link href={`/blogs?pg=${parseInt(pagenumber) + 1}`}>  <div className={styles.next}
       disabled={pagenumber && pagenumber < Math.round(count/15) - 1 ? false : true}
       ><svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8.293 4.293a1 1 0 0 0 0 1.414L14.586 12l-6.293 6.293a1 1 0 1 0 1.414 1.414l7-7a1 1 0 0 0 0-1.414l-7-7a1 1 0 0 0-1.414 0Z" fill="#000"/></svg></div></Link>
     </div></>
    );
  };

export default Paginator;