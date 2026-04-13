package com.arah.apartment_management_system.entity;

import java.time.LocalDate;
import java.util.List;

import com.arah.apartment_management_system.enums.PollStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "polls")
@Setter
@Getter
public class Poll {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String question;

	private LocalDate endDate;

	@Enumerated(EnumType.STRING)
	private PollStatus status;

	@JsonIgnore
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "created_by")
	private User createdBy;

	@OneToMany(mappedBy = "poll", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<PollOption> options;

	@OneToMany(mappedBy = "poll", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<Vote> votes;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "apartment_id")
	private Apartment apartment;
}
