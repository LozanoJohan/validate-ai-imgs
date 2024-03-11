import { useEffect, useState } from "react"
import { ref, listAll, getStorage } from "firebase/storage";
import { app } from "../firebase/client";


export function Div() {

    const [message, setMessage] = useState('')
    const [archivoUrl, setArchivoUrl] = useState("");
    const [docus, setDocus] = useState([]);

    const archivoHandler = async (e) => {

        const archivo = e.target.files[0];
        const storageRef = app.storage().ref();
        const archivoPath = storageRef.child(archivo.name);
        await archivoPath.put(archivo);

        const enlaceUrl = await archivoPath.getDownloadURL();
        setArchivoUrl(enlaceUrl);
    }
    const coleccionRef = app.firestore().collection("archivos");

    const submitHandler = async (e) => {
        e.preventDefault()

        const timestamp = Date.now();

        const docu = await coleccionRef.doc(`${timestamp}`).set({ url: archivoUrl, aiVotes: 0, humanVotes: 0, time: timestamp });

        setMessage('Archivo subido')
    }

    useEffect(async () => {
        const docusList = await app.firestore().collection("archivos").get();
        setDocus(docusList.docs.map((doc) => doc.data()));

    }, [])

    const getRandomImageIndex = () => Math.floor(Math.random() * docus.length)

    const [showPercent, setShowPercent] = useState(false)
    const [showContinue, setShowContinue] = useState(false)

    const [imageIndex, setImageIndex] = useState(getRandomImageIndex())

    const handleChoose = (doc, ai, human) => {
        // vote 0 means human, 1 means AI
        const coleccionRef = app.firestore().collection("archivos");

        setShowPercent(true)
        setShowContinue(true)

        coleccionRef.doc(`${doc.time}`).update({ aiVotes: doc.aiVotes + ai, humanVotes: doc.humanVotes + human });
    }

    const handleContinue = () => {
        setImageIndex(getRandomImageIndex())
        setShowPercent(false)
        setShowContinue(false)
    }

    return (
        <div className="flex flex-col gap-20">
            <div className="h-screen flex items-center justify-center">
                <div>
                    <h1 class="text-xl pb-5 md:text-2xl lg:text-3xl text-center font-bold">
                        This image is
                    </h1>
                    <div className="flex flex-col md:flex-row items-center justify-center ">
                        <div className="py-10 bg-emerald-600 w-full md:w-64 rounded-t-2xl md:rounded-t-none md:rounded-tl-2xl md:rounded-bl-2xl font-medium text-xl shadow-lg shadow-black/40">
                            {!showPercent ? <button className="w-full" onClick={() => handleChoose(docus[imageIndex], 1, 0)} >Generated with AI🤖</button>
                                : <p className="w-full text-center">{`${(100 * docus[imageIndex].aiVotes / (docus[imageIndex].aiVotes + docus[imageIndex].humanVotes)).toFixed(0)}%`}</p>}
                        </div>

                        <div className="relative h-fit w-fit shadow-lg shadow-black/40">
                            <img src={docus[imageIndex]?.url} className="my-auto w-full max-h-96" />
                            {showContinue && <div className="absolute flex top-0 w-full h-full bg-black/90">
                                <button className="py-5 rounded-2xl mx-auto my-auto bg-blue-600 w-3/4 font-medium text-xl " onClick={handleContinue} >
                                    Continue
                                </button>
                            </div>}
                        </div>

                        <div className="py-10 bg-blue-600 w-full md:w-64 rounded-b-2xl md:rounded-b-none md:rounded-tr-2xl md:rounded-br-2xl font-medium text-xl shadow-lg shadow-black/40">
                            {!showPercent ? <button className="w-full" onClick={() => handleChoose(docus[imageIndex], 0, 1)} >Created by human👶</button>
                                : <p className="w-full text-center">{`${(100 * docus[imageIndex].humanVotes / (docus[imageIndex].aiVotes + docus[imageIndex].humanVotes)).toFixed(0)}%`}</p>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-center">
                <h2 className='text-2xl text-center'>
                    Subir imagen a validar
                </h2>
                <form onSubmit={submitHandler} className="flex flex-col"  >
                    <input type="file" onChange={archivoHandler} />
                    <button className="mt-5 mb-40">Enviar </button>
                </form>
            </div>
        </div>
    )
}