import axios from 'axios';
import { useEffect, useState } from 'react'
import styles from './ImageUploader.module.css'

function ImageUploader(props) {

const [image,setImage] =useState(props?.data?.image ? props.data.image  : 'https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png');
const [loading,setLoading] = useState(false)



async function uploadImage(a,b,c){
    setLoading(true)
    if(!a){
        alert('File Empty')
        setLoading(false)
return 
    }
    if (a.size > 1548576) {
        alert('File size exceeds the limit of 1.5MB');
        setLoading(false)
        return; // Stop executing the function
      }
    const imageData = new FormData;
    
    
    imageData.append('file',a);
    imageData.append('upload_preset','leg7fkr7')
    
    axios.post('https://api.cloudinary.com/v1_1/duyo9pzxy/image/upload/',imageData,{
        headers: {
            'Content-Type': 'multipart/form-data'
          }
    }).then(resa=>{
        setLoading(false)
        setImage(resa.data.url)
      props.onUploadComplete(resa.data.url)
    }).catch(res=>{
        setLoading(false)
    })
    
    
    
    }

    return <div className={styles.previewBox} style={{backgroundImage:`url('${image}')`}}>
<input type={"file"} onChange={(e)=>{uploadImage(e.target.files[0])}}></input>
{!loading ? <p>Click Here to Upload/Update Image</p>:''}

{loading? <div className={styles.loader}>

<svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none">
<path opacity="0.2" fill-rule="evenodd" clip-rule="evenodd" d="M12 19C15.866 19 19 15.866 19 12C19 8.13401 15.866 5 12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#000000"/>
<path d="M2 12C2 6.47715 6.47715 2 12 2V5C8.13401 5 5 8.13401 5 12H2Z" fill="#fff"/>
</svg>
</div>:''}
    </div>
}

export default ImageUploader