# Clinicapp

Este proyecto es una aplicación web desarrollada en Angular diseñada para gestionar usuarios Especialistas y Pacientes de una clínica médica.

## Funcionalidades y navegación

El usuario debe generar una cuenta para iniciar sesión.

Una vez en el sistema, es posible navegar a distintas secciones a traves de una barra desplegable en la esquina superior izquierda.

### Secciones

Las secciones navegables son:

#### Inicio

Desde el inicio es posible navegar a las pantallas para `solicitar turnos` y `visualizar turnos creados`

`Solicitar turnos`
Si el usuario es Administrador o Paciente puede ingresar a solicitar turnos.
La pantalla cuenta con 2 input de tipo `SELECT` en donde debe seleccionar la especialidad y el especialista para el turno.
Si el usuario es administrador tambien debera seleccionar que paciente asistira al turno.
Finalmente se debe seleccionar el horario disponible para el turno.

Una vez que la informacion requerida esta completa el usuario puede enviar el formulario y generando el turno.

`Visualizar turnos creados`
Visualizara informacion distinta y dispondra de ciertas acciones dependiendo de los roles del usuario.

Los usuarios pacientes podran ver los turnos creados `por el usuario` junto con toda su informacion asociada.
Podran ejecutar acciones como `Cancelar turno`, `Calificar` y `Completar encuesta`.

Los usuarios especialistas podran ver los turnos creados `por cualquier usuario que lo haya vinculado como especialista` junto con toda su informacion asociada.
Podran ejecutar acciones como `Cancelar turno`, `Rechazar turno` y `Finalizar turno`.

Los usuarios administradores podran ver `TODOS` los turnos creados junto con toda su informacion asociada.
Podran ejecutar acciones como `Cancelar turno`.

`Cancelar/Rechazar/Finalizar turno`
El usuario debe completar un pequeño formulario explicando el motivo de la accion.

`Calificar`
El usuario debe completar un formulario indicando observaciones y llenando un rating de estrellas

`Completar encuesta`
El usuario debe completar un grupo de ratings en respuesta a las preguntas que se hagan.
