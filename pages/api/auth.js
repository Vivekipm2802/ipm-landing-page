import Cors from 'cors'

export default async function(req, res) {

   
    
    if (req.method == "POST") {
        console.log(req.body)
        const r = [{ email: 'ipmcareeronline@gmail.com', password: 'ipmcareer@79054$' }];



        if (r.findIndex(x => x.email == req.body.a.email) != -1) {
            const a = r.findIndex(x => x.email == req.body.a.email);

            if (r[a].password == req.body.a.password) {
                
                
                res.status(200).json({ logged: true, email: req.body.a.email, message: "Logged in Successfully" })
            } else {

                res.json({ logged: false, message: "Incorrect Password" });
            }
        } else {
            res.json({ logged: false, message: "Email doesn't Exist" })
        }



    } else {
        res.json({
            logged: false,
            message: "Input Error , Please Fill Correct Details"
        })
    }
}