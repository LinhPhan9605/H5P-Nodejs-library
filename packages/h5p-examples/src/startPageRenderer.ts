import * as H5P from '@LinhPhan9605/h5p-server';

export default function render(
    editor: H5P.H5PEditor
): (req: any, res: any) => any {
    return async (req, res) => {
        const contentIds = await editor.contentManager.listContent();
        const contentObjects = await Promise.all(
            contentIds.map(async (id) => ({
                content: await editor.contentManager.getContentMetadata(
                    id,
                    req.user
                ),
                id
            }))
        );
        res.send(`
    <!doctype html>
    <html>
    <head>
        <meta charset="utf-8">
        <script src="/require.js"></script>
        <link rel="stylesheet" href="/bootstrap.min.css">
        <link rel="stylesheet" href="/fontawesome-free/css/all.min.css">
        <title>H5P NodeJs</title>
    </head>
    <body>
        <div class="container my-4">
            <div class="tab-content pt-3" id="h5pTabsContent">
                <div class="tab-pane fade show active" id="list" role="tabpanel" aria-labelledby="list-tab">
                    <div class="list-group">
                        ${contentObjects
                            .map(
                                (content) => `
                                <div class="list-group-item">
                                    <div class="d-flex w-100 justify-content-between align-items-center">
                                        <div>
                                            <a href="${editor.config.baseUrl}${editor.config.playUrl}/${content.id}" target="_blank">
                                                <h5>${content.content.title}</h5>
                                            </a>
                                            <div class="small d-flex">                                            
                                                <div class="me-2">
                                                    <span class="fa fa-book-open"></span>
                                                    ${content.content.mainLibrary}
                                                </div>
                                                <div class="me-2">
                                                    <span class="fa fa-fingerprint"></span>
                                                    ${content.id}
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <a class="btn btn-secondary btn-sm" href="${editor.config.baseUrl}/edit/${content.id}">
                                                <span class="fa fa-pencil-alt"></span> edit
                                            </a>
                                            <a class="btn btn-info btn-sm" href="${editor.config.baseUrl}${editor.config.downloadUrl}/${content.id}">
                                                <span class="fa fa-file-download"></span> download
                                            </a>
                                            <a class="btn btn-info btn-sm" href="${editor.config.baseUrl}/html/${content.id}">
                                                <span class="fa fa-file-code"></span> HTML
                                            </a>
                                            <a class="btn btn-danger btn-sm" href="${editor.config.baseUrl}/delete/${content.id}">
                                                <span class="fa fa-trash-alt"></span> delete
                                            </a>
                                        </div>
                                    </div>
                                </div>`
                            )
                            .join('')}
                    </div>
                </div>
            </div>

            <hr/>
            <div id="content-type-cache-container"></div>
            <hr/>
            <div id="library-admin-container"></div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
        <script>
            requirejs.config({
                baseUrl: "assets/js",
                paths: {
                    react: '/react/umd/react.development',
                    "react-dom": '/react-dom/umd/react-dom.development'
                }
            });
            requirejs([
                "react",
                "react-dom",
                "./client/LibraryAdminComponent.js",
                "./client/ContentTypeCacheComponent.js"], 
                function (React, ReactDOM, LibraryAdmin, ContentTypeCache) {
                    const libraryAdminContainer = document.querySelector('#library-admin-container');
                    ReactDOM.render(React.createElement(LibraryAdmin.default, { endpointUrl: 'h5p/libraries' }), libraryAdminContainer);
                    const contentTypeCacheContainer = document.querySelector('#content-type-cache-container');
                    ReactDOM.render(React.createElement(ContentTypeCache.default, { endpointUrl: 'h5p/content-type-cache' }), contentTypeCacheContainer);
                });                
        </script>
    </body>
    </html>
    `);
    };
}
