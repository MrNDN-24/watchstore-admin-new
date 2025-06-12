import React, { useEffect, useState, useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import {
  getBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../services/blogServicesAdmin";
import {
  FaEdit,
  FaTrashAlt,
  FaPlusCircle,
  FaLockOpen,
  FaLock,
  FaEye,
  FaCalendarAlt,
  FaTag,
  FaImage,
} from "react-icons/fa";
import "../styles/BlogManagement.css";
import Pagination from "../components/Pagination";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BlogManagement = () => {
  const editorRef = useRef(null);

  const [blogs, setBlogs] = useState([]);
  const [newBlog, setNewBlog] = useState({
    title: "",
    image: null,
    content: "",
    type: "news",
    publishDate: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBlogId, setCurrentBlogId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Search
  const [search, setSearch] = useState("");

  useEffect(() => {
    getBlogs(currentPage, itemsPerPage, search)
      .then((data) => {
        setBlogs(data.blogs);
        setCurrentPage(data.page);
        setTotalPages(data.totalPages);
      })
      .catch((error) => console.error("Lỗi khi lấy bài viết:", error));
  }, [currentPage, search]);

  const fetchData = (page) => {
    getBlogs(page, itemsPerPage, search)
      .then((data) => {
        setBlogs(data.blogs);
        setCurrentPage(data.page);
        setTotalPages(data.totalPages);
      })
      .catch((error) => console.error("Lỗi khi lấy bài viết:", error));
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  const extractFirstImageFromContent = (htmlContent) => {
    if (!htmlContent) return null;

    // Tạo một DOM parser để phân tích HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");

    // Tìm thẻ img đầu tiên
    const firstImg = doc.querySelector("img");

    if (firstImg) {
      return firstImg.getAttribute("src");
    }

    return null;
  };

  const handleAddBlog = async () => {
    const isDuplicate = blogs.some(
      (blog) => blog.title.toLowerCase() === newBlog.title.toLowerCase()
    );

    if (isDuplicate) {
      toast.error("Tiêu đề bài viết đã tồn tại!");
      return;
    }

    const formData = new FormData();
    formData.append("title", newBlog.title);
    formData.append("type", JSON.stringify(newBlog.type));
    formData.append("publishDate", newBlog.publishDate);
    formData.append("content", newBlog.content);

    // if (newBlog.image) {
    //   formData.append("image", newBlog.image);
    // }
    // Nếu không có ảnh upload, thử lấy ảnh từ nội dung
    if (!newBlog.image) {
      const firstImageUrl = extractFirstImageFromContent(newBlog.content);
      if (firstImageUrl) {
        // Chuyển URL ảnh thành Blob để upload
        try {
          const response = await fetch(firstImageUrl);
          const blob = await response.blob();
          const file = new File([blob], "content-image.jpg", {
            type: blob.type,
          });
          formData.append("image", file);
        } catch (error) {
          console.error("Lỗi khi chuyển đổi ảnh từ nội dung:", error);
        }
      }
    } else {
      formData.append("image", newBlog.image);
    }

    try {
      await createBlog(formData);
      fetchData(currentPage);
      setNewBlog({
        title: "",
        image: null,
        content: "",
        type: "",
        publishDate: "",
      });
      setIsModalOpen(false);
      toast.success("Bài viết đã được thêm thành công!");
    } catch (error) {
      console.error("Lỗi khi thêm bài viết:", error);
      toast.error("Có lỗi xảy ra khi thêm bài viết.");
    }
  };

  const handleUpdateBlog = async () => {
    const isDuplicate = blogs.some(
      (blog) =>
        blog.title.toLowerCase() === newBlog.title.toLowerCase() &&
        blog._id !== currentBlogId
    );

    if (isDuplicate) {
      toast.error("Tiêu đề bài viết đã tồn tại!");
      return;
    }

    const formData = new FormData();
    formData.append("title", newBlog.title);
    formData.append("publishDate", newBlog.publishDate);
    formData.append("content", newBlog.content);
    formData.append("type", JSON.stringify(newBlog.type));

    // if (newBlog.image) {
    //   formData.append("image", newBlog.image);
    // } else if (currentBlogId) {
    //   const blog = blogs.find((b) => b._id === currentBlogId);
    //   if (blog?.image) {
    //     formData.append("image", blog.image);
    //   }
    // }
    // Xử lý ảnh tương tự như khi thêm mới
    if (!newBlog.image) {
      const firstImageUrl = extractFirstImageFromContent(newBlog.content);
      if (firstImageUrl) {
        try {
          const response = await fetch(firstImageUrl);
          const blob = await response.blob();
          const file = new File([blob], "content-image.jpg", {
            type: blob.type,
          });
          formData.append("image", file);
        } catch (error) {
          console.error("Lỗi khi chuyển đổi ảnh từ nội dung:", error);
        }
      } else if (currentBlogId) {
        const blog = blogs.find((b) => b._id === currentBlogId);
        if (blog?.image_url) {
          // Giữ nguyên ảnh cũ nếu không có ảnh mới và không tìm thấy ảnh trong nội dung
          formData.append("image", blog.image_url);
        }
      }
    } else {
      formData.append("image", newBlog.image);
    }

    try {
      await updateBlog(currentBlogId, formData);
      toast.success("Cập nhật bài viết thành công!");
      setIsModalOpen(false);
      setNewBlog({
        title: "",
        image: null,
        type: "news",
        content: "",
        publishDate: "",
      });
      fetchData(currentPage);
    } catch (error) {
      console.error("Lỗi khi cập nhật bài viết:", error);
      toast.error("Có lỗi xảy ra khi cập nhật bài viết.");
    }
  };

  const handleDeleteBlog = async (blogId) => {
    const isConfirmed = window.confirm(
      "Bạn có chắc chắn muốn xóa bài viết này?"
    );
    if (isConfirmed) {
      try {
        await deleteBlog(blogId);
        setBlogs(blogs.filter((blog) => blog._id !== blogId));
        toast.success("Xóa bài viết thành công!");
      } catch (error) {
        console.error("Lỗi khi xóa bài viết:", error);
        toast.error("Có lỗi xảy ra khi xóa bài viết.");
      }
    }
  };

  const handleToggleActive = async (blogId) => {
    try {
      const blog = blogs.find((b) => b._id === blogId);
      if (!blog) {
        toast.error("Không tìm thấy bài viết");
        return;
      }

      const newActiveStatus = !blog.isActive;

      const formData = new FormData();
      formData.append("isActive", newActiveStatus);

      await updateBlog(blogId, formData);

      // Cập nhật trạng thái local ngay lập tức để UI phản hồi nhanh
      setBlogs(
        blogs.map((b) =>
          b._id === blogId ? { ...b, isActive: newActiveStatus } : b
        )
      );

      toast.success(
        `Đã ${newActiveStatus ? "kích hoạt" : "vô hiệu hóa"} bài viết`
      );
    } catch (error) {
      console.error("Lỗi khi thay đổi trạng thái bài viết:", error);
      toast.error("Có lỗi xảy ra khi thay đổi trạng thái bài viết");
    }
  };
  const openModalForAdd = () => {
    setNewBlog({
      title: "",
      image: null,
      type: "news",
      content: "",
      publishDate: "",
    });
    setCurrentBlogId(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (blog) => {
    const publishDate = blog.publishDate
      ? new Date(blog.publishDate).toISOString().split("T")[0]
      : "";

    setNewBlog({
      title: blog.title,
      image: blog.image_url, // string URL or null
      content: blog.content,
      type: blog.type,
      publishDate: publishDate,
    });
    setCurrentBlogId(blog._id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setCurrentPage(1);
  };

  const handleImageUpload = (e) => {
    setNewBlog({ ...newBlog, image: e.target.files[0] });
  };
  const typeLabels = {
    news: "Tin tức",
    tips: "Mẹo hay",
    technology: "Công nghệ",
    unique_features: "Tính năng đặc biệt",
    certifications: "Chứng nhận",
    material_crafting: "Chế tác chất liệu",
  };

  const getTypeDisplay = (type) => {
    let typeArray = [];

    if (Array.isArray(type)) {
      typeArray = type;
    } else if (typeof type === "string") {
      try {
        typeArray = JSON.parse(type);
        if (!Array.isArray(typeArray)) {
          typeArray = [type];
        }
      } catch {
        typeArray = [type];
      }
    }

    return typeArray.map((t) => typeLabels[t] || t).join(", ");
  };

  // Seen blog
  const [viewBlog, setViewBlog] = useState(null);
  const openViewModal = (blog) => {
    setViewBlog(blog);
  };
  const closeViewModal = () => {
    setViewBlog(null);
  };
  return (
    <div className="blog-admin">
      <div className="blog-header">
        <h1>Quản Lý Bài Viết</h1>
        <input
          type="text"
          placeholder="Tìm kiếm bài viết..."
          className="blog-search"
          onChange={handleSearchChange}
        />
        <button onClick={openModalForAdd} className="add-blog-btn">
          <FaPlusCircle /> Thêm Mới Bài Viết
        </button>
      </div>

      <div className="blog-table">
        <table>
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Ảnh</th>
              <th>Loại bài viết</th>
              <th>Ngày đăng</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map((blog) => (
              <tr key={blog._id}>
                <td>{blog.title}</td>
                {/* <td>
                  {blog.image_url && (
                    <img
                      src={blog.image_url}
                      alt="Ảnh bài viết"
                      style={{ width: "80px", height: "auto" }}
                    />
                  )}
                </td> */}
                <td>
                  {blog.image_url ? (
                    <img
                      src={blog.image_url}
                      alt="Ảnh bài viết"
                      style={{ width: "80px", height: "auto" }}
                    />
                  ) : (
                    // Hiển thị ảnh đầu tiên từ nội dung nếu có
                    extractFirstImageFromContent(blog.content) && (
                      <img
                        src={extractFirstImageFromContent(blog.content)}
                        alt="Ảnh từ nội dung"
                        style={{ width: "80px", height: "auto" }}
                      />
                    )
                  )}
                </td>
                <td>{getTypeDisplay(blog.type)}</td>
                <td>{new Date(blog.publishDate).toLocaleDateString()}</td>
                <td>
                  <div className="blog-actions">
                    <button
                      className="seen-btn-blog"
                      onClick={() => openViewModal(blog)}
                    >
                      <span className="icon-blog">
                        {" "}
                        <FaEye />
                      </span>
                    </button>
                    <button
                      className="edit-btn-blog"
                      onClick={() => openModalForEdit(blog)}
                    >
                      <span className="icon-blog">
                        {" "}
                        <FaEdit />
                      </span>
                    </button>
                    <button
                      className="delete-btn-blog"
                      onClick={() => handleDeleteBlog(blog._id)}
                    >
                      {" "}
                      <span className="icon-blog">
                        <FaTrashAlt />
                      </span>
                    </button>

                    <button
                      onClick={() => handleToggleActive(blog._id)}
                      className="active-btn-blog"
                    >
                      {blog.isActive ? (
                        <span className="icon-blog">
                          <FaLockOpen />
                        </span>
                      ) : (
                        <span className="icon-blog">
                          <FaLock />
                        </span>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {isModalOpen && (
        <div className="modal-box-blog">
          <div className="modal-content-blog">
            <button className="close-btn-blog" onClick={closeModal}>
              x
            </button>
            <h2>{currentBlogId ? "Cập Nhật Bài Viết" : "Thêm Mới Bài Viết"}</h2>

            <div className="modal-form-split-blog">
              {/* LEFT SIDE INPUTS */}
              <div className="modal-form-left-blog">
                <input
                  type="text"
                  placeholder="Tiêu đề bài viết"
                  value={newBlog.title}
                  onChange={(e) =>
                    setNewBlog({ ...newBlog, title: e.target.value })
                  }
                />
                {newBlog.image && (
                  <div className="image-preview-blog">
                    <p>Ảnh:</p>
                    <img
                      src={
                        newBlog.image instanceof File
                          ? URL.createObjectURL(newBlog.image)
                          : newBlog.image
                      }
                      alt="Preview"
                      style={{ maxWidth: "200px", maxHeight: "100px" }}
                    />
                  </div>
                )}
                <label
                  htmlFor="blog-image-upload"
                  className="upload-button"
                >
                  <FaImage className="upload-icon" />
                  Chọn ảnh
                </label>
                <input
                  id="blog-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />

                <input
                  type="date"
                  value={newBlog.publishDate}
                  onChange={(e) =>
                    setNewBlog({ ...newBlog, publishDate: e.target.value })
                  }
                />
              </div>
              <label>Loại bài viết:</label>
              <select
                value={newBlog.type}
                onChange={(e) =>
                  setNewBlog({
                    ...newBlog,
                    type: e.target.value,
                  })
                }
              >
                <option value="news">Tin tức</option>
                <option value="tips">Mẹo hay</option>
                <option value="technology">Công nghệ</option>
                <option value="unique_features">Tính năng đặc biệt</option>
                <option value="certifications">Chứng nhận</option>
                <option value="material_crafting">Chế tác chất liệu</option>
              </select>
              {/* RIGHT SIDE TINYMCE EDITOR */}
              <div className="modal-form-right-blog">
                <Editor
                  apiKey={process.env.REACT_APP_API_TINYMCE}
                  onInit={(evt, editor) => (editorRef.current = editor)}
                  value={newBlog.content}
                  init={{
                    plugins: [
                      "anchor",
                      "autolink",
                      "charmap",
                      "codesample",
                      "emoticons",
                      "image",
                      "link",
                      "lists",
                      "media",
                      "searchreplace",
                      "table",
                      "visualblocks",
                      "wordcount",
                      "checklist",
                      "mediaembed",
                      "casechange",
                      "formatpainter",
                      "pageembed",
                      "a11ychecker",
                      "permanentpen",
                      "powerpaste",
                      "advtable",
                      "advcode",
                      "editimage",
                      "advtemplate",
                      "ai",
                      "mentions",
                      "tinycomments",
                      "tableofcontents",
                      "footnotes",
                      "mergetags",
                      "autocorrect",
                      "typography",
                      "inlinecss",
                      "markdown",
                      "importword",
                      "exportword",
                      "exportpdf",
                    ],
                    toolbar:
                      "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | " +
                      "link image media table mergetags | addcomment showcomments | spellcheckdialog " +
                      "a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | " +
                      "emoticons charmap | removeformat",
                    tinycomments_mode: "embedded",
                    tinycomments_author: "Author name",
                    mergetags_list: [
                      { value: "First.Name", title: "First Name" },
                      { value: "Email", title: "Email" },
                    ],
                    ai_request: (request, respondWith) =>
                      respondWith.string(() =>
                        Promise.reject("See docs to implement AI Assistant")
                      ),
                    height: 800,
                    menubar: false,
                    content_style:
                      "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                  }}
                  onEditorChange={(content) =>
                    setNewBlog({ ...newBlog, content: content })
                  }
                />
              </div>
            </div>

            <div className="modal-btn-blog">
              {currentBlogId ? (
                <button onClick={handleUpdateBlog}>Cập Nhật</button>
              ) : (
                <button onClick={handleAddBlog}>Thêm Mới</button>
              )}
            </div>
          </div>
        </div>
      )}

      {viewBlog && (
        <div className="modal-box-blog">
          <div className="modal-content-blog">
            <button className="close-btn-blog" onClick={closeViewModal}>
              x
            </button>
            <h2>{viewBlog.title}</h2>

            <div className="blog-meta">
              <span>
                <FaCalendarAlt />{" "}
                {new Date(viewBlog.publishDate).toLocaleDateString()}
              </span>
              <span>
                <FaTag /> {getTypeDisplay(viewBlog.type)}
              </span>
            </div>

            {/* {viewBlog.image_url && (
              <img
                src={viewBlog.image_url}
                alt="Featured"
                className="blog-featured-image"
              />
            )} */}
            {viewBlog.image_url ||
            extractFirstImageFromContent(viewBlog.content) ? (
              <img
                src={
                  viewBlog.image_url ||
                  extractFirstImageFromContent(viewBlog.content)
                }
                alt="Featured"
                className="blog-featured-image"
              />
            ) : null}

            <div
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: viewBlog.content }}
            ></div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default BlogManagement;
