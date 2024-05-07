import {path} from "@tauri-apps/api";

export class Files {

    /**
     * 提取文件的父级目录路径
     */
    static getParentPath(filePath: string): string {
        let pathArray = filePath.split(path.sep);
        // 移除最后一个元素，即当前路径
        pathArray.pop();
        // 使用 join 方法将数组重新组合成路径
        return pathArray.join(path.sep);
    }

    /**
     * 当前系统的路径分隔符
     */
    static sep = path.sep

}