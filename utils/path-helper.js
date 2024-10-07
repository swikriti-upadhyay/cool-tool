export default class PathHelper {
    static combine(...paths) {
        let path = '';
        for(let i = 0; i < paths.length; i++) {
            if (!paths[i])
                continue
            let currentPath = paths[i].toString()
            if (path.length > 0 && currentPath.startsWith('/'))
                currentPath = currentPath.substring(1, currentPath.length)
            if (path.endsWith('/'))
                path = path.substring(0, path.length - 1)
            if (path.length > 0)
                path = path + '/' + currentPath
            else
                path = currentPath
        }
        return path
    }

    static getFileName(filePath) {
        if (!filePath)
            return null
        return filePath.substring(filePath.lastIndexOf('/') + 1)
    }

    static getFolderPath(filePath) {
        if (!filePath)
            return null
        return filePath.substring(0, filePath.lastIndexOf('/') + 1)
    }
}