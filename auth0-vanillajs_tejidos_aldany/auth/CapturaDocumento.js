  const tieneDocumento = event.user.user_metadata && event.user.user_metadata.documento_numero;

  if (!tieneDocumento) {
    // Generamos un token firmado para asegurar la comunicación con tu localhost
    const sessionToken = api.redirect.encodeToken({
      secret: event.secrets.MY_REDIRECT_SECRET,
      payload: {
        iss: `https://${event.tenant.id}.auth0.com/`,
        subject: event.user.user_id,
      },
    });

    // Redirección a tu formulario en el puerto de Vite (5173)
    // He cambiado la ruta a '/completar-perfil' para que coincida con tu estructura
    api.redirect.sendUserTo("http://localhost:5173/completar-perfil.html", {
      query: { session_token: sessionToken }
    });
  }


