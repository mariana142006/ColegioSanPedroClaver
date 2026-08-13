import { Modal, Button } from "react-bootstrap";


function ModalForm({
    mostrar,
    cerrar,
    titulo,
    children,
    guardar
}){


return(

<Modal show={mostrar} onHide={cerrar} centered size="md">


    <Modal.Header closeButton>

        <Modal.Title>
            {titulo}
        </Modal.Title>

    </Modal.Header>



    <Modal.Body>

        {children}

    </Modal.Body>



    <Modal.Footer>


        <Button
            variant="secondary"
            onClick={cerrar}
        >
            Cancelar
        </Button>



        <Button
            variant="primary"
            onClick={guardar}
        >
            Guardar
        </Button>


    </Modal.Footer>



</Modal>


)

}


export default ModalForm;