import * as cc from "cc"
const { ccclass, property, executeInEditMode} = cc._decorator;
const { isLittleEndian } = cc.sys;

export interface IMeshPrivateInfo{
    _accessAttribute( primitiveIndex: number, attributeName: cc.gfx.AttributeName, accessor: (vertexBundle: cc.Mesh.IVertexBundle, iAttribute: number) => void) : void;
    _initialized : boolean;
}

function getOffset (attributes: cc.gfx.Attribute[], attributeIndex: number) {
    let result = 0;
    for (let i = 0; i < attributeIndex; ++i) {
        const attribute = attributes[i];
        result += cc.gfx.FormatInfos[attribute.format].size;
    }
    return result;
}


function getWriter (dataView: DataView, format: cc.gfx.Format) {
    const info = cc.gfx.FormatInfos[format];
    const stride = info.size / info.count;

    switch (info.type) {
    case cc.gfx.FormatType.UNORM: {
        switch (stride) {
        case 1: return (offset: number, value: number) => dataView.setUint8(offset, value);
        case 2: return (offset: number, value: number) => dataView.setUint16(offset, value, isLittleEndian);
        case 4: return (offset: number, value: number) => dataView.setUint32(offset, value, isLittleEndian);
        default:
        }
        break;
    }
    case cc.gfx.FormatType.SNORM: {
        switch (stride) {
        case 1: return (offset: number, value: number) => dataView.setInt8(offset, value);
        case 2: return (offset: number, value: number) => dataView.setInt16(offset, value, isLittleEndian);
        case 4: return (offset: number, value: number) => dataView.setInt32(offset, value, isLittleEndian);
        default:
        }
        break;
    }
    case cc.gfx.FormatType.INT: {
        switch (stride) {
        case 1: return (offset: number, value: number) => dataView.setInt8(offset, value);
        case 2: return (offset: number, value: number) => dataView.setInt16(offset, value, isLittleEndian);
        case 4: return (offset: number, value: number) => dataView.setInt32(offset, value, isLittleEndian);
        default:
        }
        break;
    }
    case cc.gfx.FormatType.UINT: {
        switch (stride) {
        case 1: return (offset: number, value: number) => dataView.setUint8(offset, value);
        case 2: return (offset: number, value: number) => dataView.setUint16(offset, value, isLittleEndian);
        case 4: return (offset: number, value: number) => dataView.setUint32(offset, value, isLittleEndian);
        default:
        }
        break;
    }
    case cc.gfx.FormatType.FLOAT: {
        return (offset: number, value: number) => dataView.setFloat32(offset, value, isLittleEndian);
    }
    default:
    }

    return null;
}


function getReader (dataView: DataView, format: cc.gfx.Format) {
    const info = cc.gfx.FormatInfos[format];
    const stride = info.size / info.count;

    switch (info.type) {
    case cc.gfx.FormatType.UNORM: {
        switch (stride) {
        case 1: return (offset: number) => dataView.getUint8(offset);
        case 2: return (offset: number) => dataView.getUint16(offset, isLittleEndian);
        case 4: return (offset: number) => dataView.getUint32(offset, isLittleEndian);
        default:
        }
        break;
    }
    case cc.gfx.FormatType.SNORM: {
        switch (stride) {
        case 1: return (offset: number) => dataView.getInt8(offset);
        case 2: return (offset: number) => dataView.getInt16(offset, isLittleEndian);
        case 4: return (offset: number) => dataView.getInt32(offset, isLittleEndian);
        default:
        }
        break;
    }
    case cc.gfx.FormatType.INT: {
        switch (stride) {
        case 1: return (offset: number) => dataView.getInt8(offset);
        case 2: return (offset: number) => dataView.getInt16(offset, isLittleEndian);
        case 4: return (offset: number) => dataView.getInt32(offset, isLittleEndian);
        default:
        }
        break;
    }
    case cc.gfx.FormatType.UINT: {
        switch (stride) {
        case 1: return (offset: number) => dataView.getUint8(offset);
        case 2: return (offset: number) => dataView.getUint16(offset, isLittleEndian);
        case 4: return (offset: number) => dataView.getUint32(offset, isLittleEndian);
        default:
        }
        break;
    }
    case cc.gfx.FormatType.FLOAT: {
        return (offset: number) => dataView.getFloat32(offset, isLittleEndian);
    }
    default:
    }

    return null;
}

function getComponentByteLength (format: cc.gfx.Format) {
    const info = cc.gfx.FormatInfos[format];
    return info.size / info.count;
}

function changeMeshAttribute( mesh : cc.Mesh, change : number){
    if(mesh == null) return;
    let size = mesh.struct.primitives.length;

    let meshPrivate = mesh as any as IMeshPrivateInfo;

    for(let i = 0; i < size; i++){
        meshPrivate._accessAttribute(i, cc.gfx.AttributeName.ATTR_TEX_COORD, (vertexBundle, iAttribute)=>{
            const vertexCount = vertexBundle.view.count;
            const { format } = vertexBundle.attributes[iAttribute];
            const StorageConstructor = cc.gfx.getTypedArrayConstructor(cc.gfx.FormatInfos[format]);
            if (vertexCount === 0) {
                return;
            }

            const inputView = new DataView(
                mesh.data.buffer,
                vertexBundle.view.offset + getOffset(vertexBundle.attributes, iAttribute),
            );

            const formatInfo = cc.gfx.FormatInfos[format];
            const reader = getReader(inputView, format);
            const writer = getWriter(inputView, format);

            if (!StorageConstructor || !reader || !writer) {
                return;
            }
            const componentCount = formatInfo.count;
            const storage = new StorageConstructor(vertexCount * componentCount);
            const inputStride = vertexBundle.view.stride;
            const outputStride = inputStride;
            const inputComponentByteLength = getComponentByteLength(format);
            const outputComponentByteLength = inputComponentByteLength;
            
            for (let iVertex = 0; iVertex < vertexCount; ++iVertex) {
                let iComponent = 0; //只需要修改 uv x 就够了
                // for (let iComponent = 0; iComponent < componentCount; ++iComponent) {
                    const inputOffset = inputStride * iVertex + inputComponentByteLength * iComponent;
                    const outputOffset = outputStride * iVertex + outputComponentByteLength * iComponent;
                    let oldValue = reader(inputOffset);
                    let value = oldValue + change*10;
                    writer(outputOffset, value);
                // }
            }
        })
    }
}

export function updateMeshTextureIdx( mesh : cc.Mesh | null, index : number){
    if(mesh == null) return;
    console.log("updateMeshTextureIdx", index);
    // if(index <= 0) return; //0 代表第一个uv 不需要改动，因为默认就是第一个
    changeMeshAttribute(mesh, index);

    let meshPrivate = mesh as any as IMeshPrivateInfo;
    meshPrivate._initialized = false;
    mesh.initialize();
}