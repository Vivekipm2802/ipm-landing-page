import styles from './Review.module.css';


function Review(props){
const a = props.data;
function convertDate(inputDate) {
  const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
  ];

  const [year, month, day] = inputDate.split("-");
  const monthIndex = parseInt(month, 10) - 1;

  const dateObject = new Date(year, monthIndex, day);
  const formattedDate = `${day} ${months[monthIndex]} ${year}`;

  return formattedDate;
}
return <div className={styles.review}>
    <img src={a.image}/>
    <h2 className={styles.name}>{a.reviewer_name} <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 22 22"
      aria-hidden="true"
      className="r-4qtqp9 r-yyyyoo r-1yjpyg1 r-1xvli5t r-dnmrzs r-bnwqim r-1plcrui r-lrvibr"
      data-testid="verificationBadge"
      {...props}
    >
      <path
        clipRule="evenodd"
        d="M13.596 3.011L11 .5 8.404 3.011l-3.576-.506-.624 3.558-3.19 1.692L2.6 11l-1.586 3.245 3.19 1.692.624 3.558 3.576-.506L11 21.5l2.596-2.511 3.576.506.624-3.558 3.19-1.692L19.4 11l1.586-3.245-3.19-1.692-.624-3.558-3.576.506zM6 11.39l3.74 3.74 6.2-6.77L14.47 7l-4.8 5.23-2.26-2.26L6 11.39z"
        fill="url(#a)"
        fillRule="evenodd"
      />
      <path
        clipRule="evenodd"
        d="M13.348 3.772L11 1.5 8.651 3.772l-3.235-.458-.565 3.219-2.886 1.531L3.4 11l-1.435 2.936 2.886 1.531.565 3.219 3.235-.458L11 20.5l2.348-2.272 3.236.458.564-3.219 2.887-1.531L18.6 11l1.435-2.936-2.887-1.531-.564-3.219-3.236.458zM6 11.39l3.74 3.74 6.2-6.77L14.47 7l-4.8 5.23-2.26-2.26L6 11.39z"
        fill="url(#b)"
        fillRule="evenodd"
      />
      <path
        clipRule="evenodd"
        d="M6 11.39l3.74 3.74 6.197-6.767h.003V9.76l-6.2 6.77L6 12.79v-1.4zm0 0z"
        fill="#D18800"
        fillRule="evenodd"
      />
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="a"
          x1={4}
          x2={19.5}
          y1={1.5}
          y2={22}
        >
          <stop stopColor="#F4E72A" />
          <stop offset={0.539} stopColor="#CD8105" />
          <stop offset={0.68} stopColor="#CB7B00" />
          <stop offset={1} stopColor="#F4EC26" />
          <stop offset={1} stopColor="#F4E72A" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="b"
          x1={5}
          x2={17.5}
          y1={2.5}
          y2={19.5}
        >
          <stop stopColor="#F9E87F" />
          <stop offset={0.406} stopColor="#E2B719" />
          <stop offset={0.989} stopColor="#E2B719" />
        </linearGradient>
      </defs>
    </svg></h2>
    <div className={styles.badge}>{a.badge}</div>
    <div className={styles.stars}>

        {Array(parseInt(a.rating) || 2).fill().map((i,d)=>{
return <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10.788 3.103c.495-1.004 1.926-1.004 2.421 0l2.358 4.777 5.273.766c1.107.161 1.549 1.522.748 2.303l-3.816 3.72.901 5.25c.19 1.103-.968 1.944-1.959 1.424l-4.716-2.48-4.715 2.48c-.99.52-2.148-.32-1.96-1.424l.901-5.25-3.815-3.72c-.801-.78-.359-2.142.748-2.303L8.43 7.88l2.358-4.777Z" fill="#222F3D"/></svg>
        })}
    </div>
    <div className={styles.comment}>{a.comment}</div>
    <p className={styles.date}>{convertDate(a.review_date)}</p>
</div>


}

export default Review;