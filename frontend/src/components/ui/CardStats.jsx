import { FaArrowUp } from "react-icons/fa";


function CardStats({titulo, cantidad, icono, color}){


    return(

        <div 
            className="card shadow-sm border-0"
        >

            <div className="card-body d-flex justify-content-between align-items-center">


                <div>

                    <h6 className="text-muted">
                        {titulo}
                    </h6>


                    <h2 className="fw-bold">
                        {cantidad}
                    </h2>


                    <small className="text-success">
                        <FaArrowUp/>
                        Actualizado
                    </small>


                </div>



                <div

                    style={{
                        width:"60px",
                        height:"60px",
                        borderRadius:"15px",
                        background:color,
                        display:"flex",
                        alignItems:"center",
                        justifyContent:"center",
                        color:"white",
                        fontSize:"25px"
                    }}

                >

                    {icono}

                </div>


            </div>


        </div>


    )

}


export default CardStats;