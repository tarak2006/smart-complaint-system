module.exports = async function (context, req) {
    context.log('Generating unique complaint ID...');

    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 8);
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const complaintId = `AST-${timestamp}-${randomStr}`;

    context.res = {
        status: 200,
        body: {
            id: complaintId,
            generatedAt: new Date().toISOString()
        }
    };
}
