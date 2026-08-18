import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import Alert from '../../components/Alert';
import Skeleton from '../../components/Skeleton';
import { ArrowLeft, Save, FileSpreadsheet, Award } from 'lucide-react';

const ResultEntry = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  // Data States
  const [exam, setExam] = useState(null);
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dynamically compute Grade based on marks
  const getInstantGrade = (marks, maxMarks) => {
    if (marks === '' || marks === undefined || marks === null) return '';
    const num = Number(marks);
    if (isNaN(num) || num < 0 || num > maxMarks) return 'Invalid';
    const pct = (num / maxMarks) * 100;
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B';
    if (pct >= 60) return 'C';
    if (pct >= 50) return 'D';
    return 'F';
  };

  const fetchExamAndRoster = async () => {
    setLoading(true);
    setError('');
    try {
      const [examData, rosterData] = await Promise.all([
        api.exams.get(examId),
        api.exams.getResultsRoster(examId),
      ]);
      setExam(examData);
      setRoster(rosterData);
    } catch (err) {
      setError(err.message || 'Failed to retrieve grading sheets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamAndRoster();
  }, [examId]);

  const handleMarksChange = (studentId, val) => {
    setRoster(prev =>
      prev.map(row => (row.studentId === studentId ? { ...row, marksObtained: val } : row))
    );
  };

  const handleRemarksChange = (studentId, val) => {
    setRoster(prev =>
      prev.map(row => (row.studentId === studentId ? { ...row, remarks: val } : row))
    );
  };

  const handleSaveGrades = async () => {
    // Validate marks values
    const invalid = roster.find(row => {
      if (row.marksObtained === '') return false;
      const num = Number(row.marksObtained);
      return isNaN(num) || num < 0 || num > exam.maxMarks;
    });

    if (invalid) {
      setError(`Please verify student marks. Values must be between 0 and ${exam.maxMarks}.`);
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccess('');
    try {
      const recordsToSave = roster.map(row => ({
        studentId: row.studentId,
        marksObtained: row.marksObtained,
        remarks: row.remarks,
      }));

      await api.exams.saveBulkResults(examId, recordsToSave);
      setSuccess('Student examination grades recorded successfully!');
      fetchExamAndRoster();
    } catch (err) {
      setError(err.message || 'Failed to submit marks sheets.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <Skeleton variant="rect" height="400px" />;
  }

  return (
    <div>
      <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '20px' }}>
        <ArrowLeft size={16} />
        <span>Back to Exams</span>
      </button>

      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div className="page-title-desc">
          <h2>Result Grading Sheets</h2>
          <p className="page-description">
            Exam: <strong>{exam.examName}</strong> • Subject: <strong>{exam.course?.courseName} ({exam.course?.courseCode})</strong> • Max Marks: <strong>{exam.maxMarks}</strong>
          </p>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      <div className="dashboard-card" style={{ padding: '24px 0' }}>
        <h3 className="dashboard-card-title" style={{ padding: '0 24px 12px 24px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileSpreadsheet size={18} className="icon-muted" />
          <span>Student Grading Roster ({roster.length} enrolled)</span>
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '20px 24px' }}>
          {roster.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>
              No active students enrolled in this course roster.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {roster.map((row) => {
                const grade = getInstantGrade(row.marksObtained, exam.maxMarks);
                return (
                  <div key={row.studentId} className="result-row">
                    <div className="student-info" style={{ flex: 1, minWidth: '200px' }}>
                      <span className="student-name">{row.name}</span>
                      <span className="student-uid">{row.studentUid}</span>
                    </div>

                    <div className="result-input-group">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Marks (Max: {exam.maxMarks})</span>
                        <input
                          type="text"
                          className="input-marks"
                          value={row.marksObtained}
                          onChange={(e) => handleMarksChange(row.studentId, e.target.value)}
                          placeholder="Marks"
                          disabled={isSaving}
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center', minWidth: '60px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Grade</span>
                        <span
                          className={`badge badge-${grade === 'F' ? 'error' : grade ? 'success' : 'info'}`}
                          style={{ minHeight: '26px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '40px', fontSize: '0.8rem' }}
                        >
                          {grade || '-'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Feedback / Remarks</span>
                        <input
                          type="text"
                          className="input-remarks"
                          value={row.remarks}
                          onChange={(e) => handleRemarksChange(row.studentId, e.target.value)}
                          placeholder="e.g. Good performance"
                          disabled={isSaving}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button onClick={handleSaveGrades} className="btn btn-primary" disabled={isSaving}>
                  <Save size={16} />
                  <span>{isSaving ? 'Submitting Sheets...' : 'Save Grading Sheets'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultEntry;
