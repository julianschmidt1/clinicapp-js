export const authErrorMessage = (message: string): string => {
    switch (message) {
        case 'auth/invalid-email':
            return 'El correo ingresado no es valido.'
        case "auth/email-already-in-use":
            return 'El correo ingresado ya fue registrado.'
        case "auth/weak-password":
            return 'La contraseña debe tener por lo menos 6 caracteres.'
        default:
            return 'Las credenciales no coinciden.';
    }
}