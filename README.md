# Clinicapp

Este proyecto es una aplicación web desarrollada en Angular diseñada para gestionar usuarios Especialistas y Pacientes de una clínica médica.

## Funcionalidades y navegación

El usuario debe generar una cuenta para iniciar sesión.

![register](https://github.com/julianschmidt1/clinicapp-js/assets/47337611/61e5dc32-a6a2-41cc-94b1-ed82bb0bc75d)

![register2](https://github.com/julianschmidt1/clinicapp-js/assets/47337611/82a6e241-4334-469f-8ed1-087da1066921)

![login](https://github.com/julianschmidt1/clinicapp-js/assets/47337611/98d4b16c-0803-46bd-97c7-ad4ce1e73384)

Una vez en el sistema, es posible navegar a distintas secciones a traves de una barra desplegable en la esquina superior izquierda.

### Secciones

Las secciones navegables son:

#### Inicio

Desde el inicio es posible navegar a las pantallas para `solicitar turnos`, `visualizar turnos creados` y `perfil`

![home](https://github.com/julianschmidt1/clinicapp-js/assets/47337611/ea886342-b278-427a-9fb7-75663f77c1f8)

`Solicitar turnos`
Si el usuario es Administrador o Paciente puede ingresar a solicitar turnos.
El usuario debe seleccionar la especialidad, el especialista, un dia y horario disponible.
En caso de que el usuario sea administrador, tambien debe especificar que usuario sera el paciente.

![altaturno](https://github.com/julianschmidt1/clinicapp-js/assets/47337611/f1f7d317-f767-43f1-b655-c9cbe8d4c2d7)

Una vez que la informacion requerida esta completa el usuario puede enviar el formulario y generando el turno.

`Visualizar turnos creados`
Visualizara informacion distinta y dispondra de ciertas acciones dependiendo de los roles del usuario.

Los usuarios pacientes podran ver los turnos creados `por el usuario` junto con toda su informacion asociada.
Podran ejecutar acciones como `Cancelar turno`, `Calificar` y `Completar encuesta`.

Los usuarios especialistas podran ver los turnos creados `por cualquier usuario que lo haya vinculado como especialista` junto con toda su informacion asociada.
Podran ejecutar acciones como `Cancelar turno`, `Rechazar turno`, `Finalizar turno`, `Cargar historia clinica`.

![Screenshot 2024-07-04 165812](https://github.com/julianschmidt1/clinicapp-js/assets/47337611/b8bb7fd3-56b2-4dea-b789-e324bcd81ea3)

![Screenshot 2024-07-04 165830](https://github.com/julianschmidt1/clinicapp-js/assets/47337611/5074652c-6af2-4327-9490-b082a0e32bf9)

Los usuarios administradores podran ver `TODOS` los turnos creados junto con toda su informacion asociada.
Podran ejecutar acciones como `Cancelar turno`.

`Cancelar/Rechazar/Finalizar turno`
El usuario debe completar un pequeño formulario explicando el motivo de la accion.

`Calificar`
El usuario debe completar un formulario indicando observaciones y llenando un rating de estrellas
![rate-atencion](https://github.com/julianschmidt1/clinicapp-js/assets/47337611/63e63baf-77e7-4a00-be72-374aaff2f443)

`Completar encuesta`
El usuario debe completar un grupo de ratings en respuesta a las preguntas que se hagan.
![survey](https://github.com/julianschmidt1/clinicapp-js/assets/47337611/24af6c0e-5cb8-4e68-8e6a-1b9a7f273c15)

![turnos](https://github.com/julianschmidt1/clinicapp-js/assets/47337611/c6ae02b1-678e-4022-bf02-89154f76c64f)

#### Gestion de usuarios

Unicamente accesible por usuarios con rol administrador.
Listado de usuarios de la aplicacion. Muestra informacion detallada de los usuarios y permite habilitar/deshabilitar a los especialistas.
Permite visualizar la historia clinica cargada en los usuarios de tipo paciente, creacion de usuarios y exportar listado de usuarios como excel.

 ![users](https://github.com/julianschmidt1/clinicapp-js/assets/47337611/fdb33b2f-04ab-4809-8e4a-136fd0ffd32e)

![history](https://github.com/julianschmidt1/clinicapp-js/assets/47337611/187461c3-b6f4-4446-a05d-a5b68e6f9e67)


### Perfil

![profile](https://github.com/julianschmidt1/clinicapp-js/assets/47337611/35d687f2-54b8-442a-8867-49e2c65db634)

Muestra la informacion general con la cual se registro al usuario, asi como sus imagenes.
Si el usuario es de tipo `paciente`, este tendra la posibilidad de clickear en una de sus imagenes, alternando entre ellas.
Ademas, los pacientes pueden visualizar su datos de historia clinica cargados.

![profile-history](https://github.com/julianschmidt1/clinicapp-js/assets/47337611/bc2fefc8-1227-4303-9a5e-58c766dbd95e)

Si el usuario es de tipo `especialista`, este tendra una seccion debajo que le permitira ingresar sus horarios de atencion y disponibilidad.

![horario-especialista](https://github.com/julianschmidt1/clinicapp-js/assets/47337611/b8dcbed6-ba8d-48ae-a46c-cce80a04e412)

