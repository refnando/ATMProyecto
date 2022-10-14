// Función que sirve para seleccionar por id del dom html 
const idSel = (id)=>{
    return document.getElementById(id)
}

const recuperaCuentas=()=>{
    return JSON.parse(localStorage.getItem("cuentas") )
}

const mostrarElemento = (id)=>{  idSel(id).style = 'display:block'}
const ocultarElemento = (id)=>{  idSel(id).style = 'display:none'}

const validaLogin =()=>{
    idSel('form-login').addEventListener('submit',function(e) {
        e.preventDefault();
        
        const inputUser = idSel('inputUser').value.trim();
        const inputNip = idSel('inputNip').value.trim();

        // es de tipo let por que se le pueden agregar mas valores por lo tanto no es constante y acumula los errores de login
        let errors = [];

        if(inputUser=='')
            errors.push('Usuario')
        
        if( inputNip =='')
            errors.push('NIP')

        if(errors.length){
            Swal.fire({
                icon: 'error',
                title: 'Favor de revisar',
                text: errors.join(', '),
                // footer: '<a href="">Why do I have this issue?</a>'
              })
        }
        // en caso de no haber error se revisan los datos del login con las cuentas
        else{

            //obtenemos las cuentas almacenadas de localstorage
            const cuentas = recuperaCuentas()
            // console.log(resp)
            //buscamos la cuenta que coincida con usuario y password
            const resp = cuentas.find((obj)=>{
                if(inputUser==obj.nombre && inputNip==obj.pass)
                    return obj
            })
            
            // en caso de existir una respuesta nos dara un json con los datos del login
            if( resp )
                localStorage.setItem("actual",JSON.stringify(resp))
        
            // en caso de no coincidir el Login
            else{
               
                Swal.fire({
                    icon: 'error',
                    title: 'Favor de revisar',
                    text: 'Usuario/password',
                    // footer: '<a href="">Why do I have this issue?</a>'
                  })
            }
            
            revisaActualLogin();
        }
        
    });
}

const revisaActualLogin = ()=>{
    const actual = JSON.parse(localStorage.getItem("actual"))
    if(actual){
        ocultarElemento('home');
        mostrarElemento('account');
        idSel('name').innerHTML = actual.nombre
    }else{
        ocultarElemento('account');
        mostrarElemento('home');
        idSel('name').innerHTML = ''
    }
   
}

const cargaCtasLocalStorage =()=>{
    //si no existe el storage de cuentas lo inicializa con las cuentas por default
    if( !localStorage.getItem("cuentas") )
        localStorage.setItem("cuentas", JSON.stringify(init()));
}

const creaComboCuentas = ()=>{
    // Carga listado de cuentas en el select html de cuentas
    let option = '<option value="">Seleccione una opción</option>';
    init().forEach((obj) =>{
        option += `<option value="${obj.nombre}">${obj.nombre}</option>`;
    })

    idSel('inputUser').innerHTML = option; 
}

const eventoConsultaSaldo =()=>{
    idSel('consulta').addEventListener('click',function(e) {
        e.preventDefault();
        // ocultarElemento('operaciones');
        mostrarElemento('contenido');
        const actual = JSON.parse(localStorage.getItem("actual"))

        const divSaldo =`<div class="row">
                            <h2>Tu Saldo es de: ${actual.saldo}</h2>
                         </div>`;
        
        idSel('contenido').innerHTML = divSaldo
    })
}

const eventoOperacion = ()=>{

    idSel('deposito').addEventListener('click',function(e) {
        e.preventDefault();
        tipoOperacion('Deposito')      
    }) 

    idSel('retiro').addEventListener('click',function(e) {
        e.preventDefault();
        tipoOperacion('Retiro')      
    }) 
}

const tipoOperacion = (tipo)=>{
    mostrarElemento('contenido');
    const actual = JSON.parse(localStorage.getItem("actual"))

    const divSaldo =`<div class="row">
                        <h2>Tu Saldo actual es de <span id="saldoa">: ${actual.saldo}</span></h2>
                        <form class="form-control" id="form_operacion">
                            <div class="mb-3">
                                <label for="exampleInputEmail1" class="form-label">Cantidad $</label>
                                <input type="number" class="form-control" id="cant_dep">
                                <input type="hidden" id="tipo" value="${tipo}">
                            </div>
                            <div class="mb-3">
                                <button type="submit" class="btn btn-primary">${tipo}</button>
                            </div>
                        </form>
                     </div>`;
    
    idSel('contenido').innerHTML = divSaldo

    eventoFormaDep();
}

const guardaDeposito = function(e) {
    e.preventDefault();
    const tipo = idSel('tipo').value.trim();
    const cant_dep = idSel('cant_dep').value.trim();
    const actual = JSON.parse(localStorage.getItem("actual"))
    
    const temporal = (tipo=='Deposito')
                    ? Number(Math.abs(cant_dep)) + Number(actual.saldo)
                    : Number(actual.saldo) - Number(Math.abs(cant_dep));

    if(temporal >= 10 && temporal<= 990){

        actual.saldo = Number(temporal).toFixed(2);
        
        idSel('saldoa').textContent = actual.saldo;
        idSel('cant_dep').value = '';

        localStorage.setItem("actual",JSON.stringify(actual))
        let cuentas = JSON.parse(localStorage.getItem("cuentas"))
        cuentas = cuentas.map((obj)=>{
                if(obj.nombre==actual.nombre){
                obj.saldo = actual.saldo
            }
            return obj;
        })

        localStorage.setItem("cuentas",JSON.stringify(cuentas))
    }else{
        Swal.fire({
            icon: 'error',
            title: 'Favor de revisar la cantidad',
            text: 'Su saldo no puede ser menor de $10 o mayor de $990',
            // footer: '<a href="">Why do I have this issue?</a>'
          })
    }
   
}

const eventoFormaDep = ()=>{
    idSel('form_operacion').removeEventListener('submit',guardaDeposito)
    idSel('form_operacion').addEventListener('submit',guardaDeposito)
}

const logOut = function(e) {
    e.preventDefault()
    idSel('contenido').innerHTML=''
    localStorage.removeItem('actual')
    revisaActualLogin()
}

const cerrarSesion = ()=>{
    idSel('cerrar_sesion').removeEventListener('click',logOut)
    idSel('cerrar_sesion').addEventListener('click',logOut) 
}

window.addEventListener('load', (event) => {

    revisaActualLogin();
    
    creaComboCuentas();
    
    cargaCtasLocalStorage();

    validaLogin();

    eventoConsultaSaldo();

    eventoOperacion();

    cerrarSesion();
});