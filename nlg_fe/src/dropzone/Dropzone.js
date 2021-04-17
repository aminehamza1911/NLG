import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import './Dropzone.css';
import Select from 'react-select';
const Dropzone = () => {
    const data = [
        {
            value: 'fr',
            label: "French"
          },
  
          {
            value: 'en',
            label: "English"
          }, 
    
  {
            value: 'es',
            label: "Spanish"
          },
  {
            value: 'de',
            label: "German"
          },

  {
            value: 'pt',
            label: "Portuguese"
          },
  {
            value: 'ru',
            label: "Russian"
          },

  {
            value: 'hi',
            label: "Hindi"
          },

  {
            value: 'pl',
            label: "Polish"
          },
  {
            value: 'zh',
            label: "Chinese (Simplified)"
          },
  {
            value: 'el',
            label: "Greek"
          },
  {
            value: 'tr',
            label: "Turkish"  
  
          },
  {
            value: 'nl',
            label: "Dutch"
          }
      ];
    const fileInputRef = useRef();
    const modalImageRef = useRef();
    const modalRef = useRef();
    const progressRef = useRef();
    const uploadRef = useRef();
    const uploadModalRef = useRef();
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [validFiles, setValidFiles] = useState([]);
    const [unsupportedFiles, setUnsupportedFiles] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
     // set value for default selection
  const [selectedValue, setSelectedValue] = useState('');

  // handle onChange event of the dropdown
  const handleChange = e => {
    setSelectedValue(e.value);
  }
   
    useEffect(() => {
        let filteredArr = selectedFiles.reduce((acc, current) => {
            const x = acc.find(item => item.name === current.name);
            if (!x) {
              return acc.concat([current]);
            } else {
              return acc;
            }
        }, []);
        setValidFiles([...filteredArr]);
        
    }, [selectedFiles]);

    const preventDefault = (e) => {
        e.preventDefault();
        // e.stopPropagation();
    }

    const dragOver = (e) => {
        preventDefault(e);
    }
    
  

    const dragEnter = (e) => {
        preventDefault(e);
    }

    const dragLeave = (e) => {
        preventDefault(e);
    }

    const fileDrop = (e) => {
        preventDefault(e);
        const files = e.dataTransfer.files;
        if (files.length) {
            handleFiles(files);
        }
    }

    const filesSelected = () => {
        if (fileInputRef.current.files.length) {
            handleFiles(fileInputRef.current.files);
        }
    }

    const fileInputClicked = () => {
        fileInputRef.current.click();
    }

    const handleFiles = (files) => {
        for(let i = 0; i < files.length; i++) {
            if (validateFile(files[i])) {
                setSelectedFiles(prevArray => [...prevArray, files[i]]);
            } else {
                files[i]['invalid'] = true;
                setSelectedFiles(prevArray => [...prevArray, files[i]]);
                setErrorMessage('File type not permitted');
                setUnsupportedFiles(prevArray => [...prevArray, files[i]]);
            }
        }
    }

    const validateFile = (file) => {
        const validTypes = ['application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
        if (validTypes.indexOf(file.type) === -1) {
            return false;
        }

        return true;
    }

    const fileSize = (size) => {
        if (size === 0) {
          return '0 Bytes';
        }
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(size) / Math.log(k));
        return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    const fileType = (fileName) => {
        return fileName.substring(fileName.lastIndexOf('.') + 1, fileName.length) || fileName;
    }

    const removeFile = (name) => {
        const index = validFiles.findIndex(e => e.name === name);
        const index2 = selectedFiles.findIndex(e => e.name === name);
        const index3 = unsupportedFiles.findIndex(e => e.name === name);
        validFiles.splice(index, 1);
        selectedFiles.splice(index2, 1);
        setValidFiles([...validFiles]);
        setSelectedFiles([...selectedFiles]);
        if (index3 !== -1) {
            unsupportedFiles.splice(index3, 1);
            setUnsupportedFiles([...unsupportedFiles]);
        }
        window.location.reload(false);
    }

    const openImageModal = (file) => {
        const reader = new FileReader();
        modalRef.current.style.display = "block";
        reader.readAsDataURL(file);
        reader.onload = function(e) {
            modalImageRef.current.style.backgroundImage = `url(${e.target.result})`;
        }
    }

    const closeModal = () => {
        modalRef.current.style.display = "none";
        modalImageRef.current.style.backgroundImage = 'none';
    }

    const uploadFiles = async (event) => {
        const format = event.target.value;
        const lang = selectedValue;
        uploadModalRef.current.style.display = 'block';
        uploadRef.current.innerHTML = 'File Uploading...';
        for (let i = 0; i < validFiles.length; i++) {
            const formData = new FormData();
            formData.append('file', validFiles[i]);
            formData.append('format',format);
            formData.append('lang',lang);
            const fn = validFiles[i].name.split('.')[0] + '.'+format;

            //formData.append('key', '');

            axios({
                method: 'post',
                url: 'http://' + window.location.hostname+':3001/upload',
                responseType: 'arraybuffer',
                data: formData,
                
                onUploadProgress: (progressEvent) => {
                    const uploadPercentage = Math.floor((progressEvent.loaded / progressEvent.total) * 100);
                    progressRef.current.innerHTML = `${uploadPercentage}%`;
                    progressRef.current.style.width = `${uploadPercentage}%`;

                    if (uploadPercentage === 100) {
                        uploadRef.current.innerHTML = `<span class="succes">The file has been successfully generated</span>`;
                        validFiles.length = 0;
                        setValidFiles([...validFiles]);
                        setSelectedFiles([...validFiles]);
                        setUnsupportedFiles([...validFiles]);
                    }
                },
            }).then((res) => {
                const url = window.URL.createObjectURL(new Blob([res.data]
                    ,{type: res.headers['content-type']}))
                  var link = document.createElement('a');
                  link.href = url;
                  link.setAttribute('download', fn);
                  document.body.appendChild(link);
                  link.click();

               
            })
            
        }
    }
    


    const closeUploadModal = () => {
        uploadModalRef.current.style.display = 'none';
        window.location.reload(false);


    }


    return (
        <>
            <div className="container">
           
                {unsupportedFiles.length ? <p>Please remove all unsupported files.</p> : ''}
                <div className="drop-container"
                    onDragOver={dragOver}
                    onDragEnter={dragEnter}
                    onDragLeave={dragLeave}
                    onDrop={fileDrop}
                    onClick={fileInputClicked}
                >
                    <div className="drop-message">
                        <div className="upload-icon"></div>
                        Drag & Drop files here or click to select file(s) 
                    </div>
                    <input
                        ref={fileInputRef}
                        className="file-input"
                        type="file"
                        //multiple
                        onChange={filesSelected}
                        accept='application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    />
    
                </div>
                    
                <div className="file-display-container">
                    {
                        validFiles.map((data, i) => 
                            <div className="file-status-bar" key={i}>
                                <div onClick={!data.invalid ? () => openImageModal(data) : () => removeFile(data.name)}>
                                    <div className="file-type-logo"></div>
                                    <div className="file-type">{fileType(data.name)}</div>
                                    <span className={`file-name ${data.invalid ? 'file-error' : ''}`}>{data.name}</span>
                                    <span className="file-size">({fileSize(data.size)})</span> {data.invalid && <span className='file-error-message'>({errorMessage})</span>}
                                </div>
                                <div className="file-remove" onClick={() => removeFile(data.name)}>X</div>
                            </div>
                        )
                    }
                </div>
                {unsupportedFiles.length === 0 && validFiles.length ?  
                
                <div className="emplacement">
               
               <div className="select">
               <Select className="select-text"
        placeholder="Select language"
        value={data.find(obj => obj.value === selectedValue)} // set selected value
        options={data} // set list of the data
        onChange={handleChange} // assign onChange function
      />

									</div>
						<input className="checkbox-tools" type="radio" name="pdf" value="pdf" id="tool-1" onClick={uploadFiles} />
						<label className="for-checkbox-tools" for="tool-1">
							<i className='pdf'></i>PDF
						</label>
					<input className="checkbox-tools" type="radio" name="docx" value="docx" id="tool-2" onClick={uploadFiles} />
						<label className="for-checkbox-tools" for="tool-2">
                        <i className='word'></i>DOCX
						</label>
                        
                        </div>
                        
                        
                        : ''}
                        
             </div>
            
            
            <div className="modal" ref={modalRef}>
                <div className="overlay"></div>
                <span className="close" onClick={(() => closeModal())}>X</span>
                <div className="modal-image" ref={modalImageRef}></div>
            </div>

            <div className="upload-modal" ref={uploadModalRef}>
                <div className="overlay"></div>
                <div className="close" onClick={(() => closeUploadModal())}>X</div>
                <div className="progress-container">
                    <span ref={uploadRef}></span>
                    <div className="progress">
                        <div className="progress-bar" ref={progressRef}></div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Dropzone;
