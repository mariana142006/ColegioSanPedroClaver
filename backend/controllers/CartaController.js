const Carta = require("../models/CartaModel");


// listar cartas
const listarCartas = async (req,res)=>{

  try {

    const datos = await Carta.obtenerCartas();

    res.json(datos);


  } catch(error){

    console.log(error);

    res.status(500).json({
      mensaje:error.message
    });

  }

};


// guardar carta
const guardarCarta = async(req,res)=>{

  try {

    const resultado = await Carta.crearCarta(req.body);


    res.json({
      mensaje:"Carta guardada correctamente",
      id:resultado.insertId
    });


  } catch(error){

    console.log(error);

    res.status(500).json({
      mensaje:error.message
    });

  }

};

const obtenerNumeroReporte = async (req, res) => {
  try {

    const numero = await Carta.obtenerSiguienteNumero();

    res.json({
      numero,
    });

  } catch (error) {

    res.status(500).json({
      mensaje: error.message,
    });

  }
};


module.exports={
  listarCartas,
  guardarCarta,
  obtenerNumeroReporte,
};