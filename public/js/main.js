$(document).ready( () => {
    $('#delete').on('click', (e) => {
        $target = $(e.target);
        const id = $target.attr('data-id');
        $.ajax({
            type: 'DELETE',
            url: '/articles/'+id,
            success: (res) => {
                window.location.href='/';
            },
            error: (err) => {
                console.log(err.message);
            }
        });
    });
});