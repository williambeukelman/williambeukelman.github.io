<style>
</style>

<script>
  let formEmail = "";
  let formSubject = "";
  let formMsg = "";
  $: formFilled =
    formEmail.length > 1 && formSubject.length > 1 && formMsg.length > 1;
  $: validEmail = /\S+@\S+\.\S+/.test(formEmail);
  $: SubmitText = ValidForm
    ? "Send"
    : !formFilled
    ? "Fill Out Form"
    : "Invalid Email Format";
  $: SubmitStyle = ValidForm
    ? "btn-primary"
    : !formFilled
    ? "btn-secondary"
    : "btn-danger";
  $: ValidForm = formFilled && validEmail;
  function handleFormSubmit() {
    //Clear form
    formEmail = "";
    formSubject = "";
    formMsg = "";
  }
</script>

<div class="modal fade py-5" tabindex="-1" role="dialog" id="modalMessage" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content rounded-5 shadow">
      <div class="modal-header p-5 pb-4 border-bottom-0">
        <h2 class="fw-bold mb-0">Send a message</h2>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>

      <div class="modal-body p-5 pt-0">
        <form class="">
          <div class="form-floating mb-3">
            <input bind:value={formEmail} type="email" class="form-control rounded-4" id="inputEmail" placeholder="name@example.com">
            <label for="inputEmail">Your email</label>
          </div>
          <div class="form-floating mb-3">
            <input bind:value={formSubject} type="text" class="form-control rounded-4" id="inputSubject" placeholder="Subject line">
            <label for="inputSubject">Subject</label>
          </div>
          <div class="form-floating mb-3">
            <textarea bind:value={formMsg} class="form-control rounded-4" id="inputMessage"></textarea>
            <label for="inputMessage">Message</label>
          </div>
          <button disabled={!ValidForm} on:click={handleFormSubmit} type="button" class="w-100 mb-2 btn btn-lg rounded-4 {SubmitStyle}" data-bs-dismiss="modal">{SubmitText}</button>
        </form>
      </div>
    </div>
  </div>
</div>

<div class="container-fluid d-flex justify-content-center bg-dark text-white py-3">
  <div class="row">
    <div class="col">
      <p>Website & Design by William Beukelman</p>
    </div>
    <!--
    <div class="col-6">
      <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalMessage">
      <span class="badge">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-envelope" viewBox="0 0 16 16">
          <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
        </svg>
      </span>
      Send a message</button>
    </div>
    -->
  </div>
</div>