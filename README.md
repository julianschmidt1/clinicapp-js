# Clinicapp

Este proyecto es una aplicación web desarrollada en Angular diseñada para gestionar usuarios Especialistas y Pacientes de una clínica médica.

## Funcionalidades y navegación

El usuario debe generar una cuenta para iniciar sesión.

Una vez en el sistema, es posible navegar a distintas secciones a traves de una barra desplegable en la esquina superior izquierda.

### Secciones

Las secciones navegables son:

#### Inicio

Desde el inicio es posible navegar a las pantallas para `solicitar turnos` y `visualizar turnos creados`

Si el usuario es Administrador o Paciente puede ingresar a solicitar turnos.
La pantalla cuenta con 2 input de tipo `SELECT` en donde debe seleccionar la especialidad y el especialista para el turno.
Si el usuario es administrador tambien debera seleccionar que paciente asistira al turno.
Finalmente se debe seleccionar el horario disponible para el turno.

Una vez que la informacion requerida esta completa el usuario puede enviar el formulario y generando el turno.
